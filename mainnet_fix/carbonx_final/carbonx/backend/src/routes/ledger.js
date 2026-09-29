/**
 * /api/v1/ledger – On-chain retirement records
 * Read-only public ledger + authenticated retirement submission
 */

const router = require('express').Router()
const Joi    = require('joi')
const { v4: uuidv4 } = require('uuid')
const db     = require('../db/client')
const { requireAuth, optionalAuth } = require('../middleware/auth')

// ─── GET / – public retirement ledger ────────────────────────────
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { project_id, wallet, limit = 50, offset = 0 } = req.query

    let query = db('retirements')
      .leftJoin('projects', 'retirements.project_id', 'projects.id')
      .leftJoin('users', 'retirements.user_id', 'users.id')
      .select(
        'retirements.*',
        'projects.name as project_name',
        'projects.location as project_location',
        'projects.validator_badge',
        'users.full_name as user_name',
      )
      .orderBy('retirements.retired_at', 'desc')
      .limit(Math.min(parseInt(limit), 200))
      .offset(parseInt(offset))

    if (project_id) query = query.where('retirements.project_id', project_id)
    if (wallet)     query = query.where('retirements.retiree_wallet', wallet.toLowerCase())

    const [retirements, [{ count }]] = await Promise.all([
      query,
      db('retirements').count('id as count'),
    ])

    // Aggregate stats
    const [stats] = await db('retirements')
      .select(
        db.raw('COUNT(*) as total_retirements'),
        db.raw('SUM(amount) as total_tons_retired'),
        db.raw('COUNT(DISTINCT retiree_wallet) as unique_retirees'),
      )

    res.json({
      retirements,
      total: parseInt(count),
      stats: {
        total_retirements: parseInt(stats.total_retirements),
        total_tons_retired: parseInt(stats.total_tons_retired) || 0,
        unique_retirees:    parseInt(stats.unique_retirees),
      },
    })
  } catch (err) { next(err) }
})

// ─── POST /retire – record an on-chain retirement ─────────────────
// Called after client has broadcast the tx; stores the verified record
router.post('/retire', requireAuth, async (req, res, next) => {
  const schema = Joi.object({
    project_id:      Joi.string().uuid().required(),
    token_id:        Joi.number().integer().min(1).required(),
    amount:          Joi.number().integer().min(1).required(),
    retirement_note: Joi.string().max(500).optional().allow(''),
    tx_hash:         Joi.string().pattern(/^0x[a-fA-F0-9]{64}$/).required(),
    block_number:    Joi.number().integer().optional(),
    retiree_wallet:  Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  })

  try {
    const { error, value } = schema.validate(req.body)
    if (error) return res.status(422).json({ error: error.details[0].message })

    // Idempotency – prevent duplicate tx_hash submissions
    const existing = await db('retirements').where({ tx_hash: value.tx_hash }).first()
    if (existing) return res.status(409).json({ error: 'This transaction has already been recorded.' })

    const [record] = await db('retirements')
      .insert({
        id:              uuidv4(),
        project_id:      value.project_id,
        user_id:         req.user.id,
        retiree_wallet:  value.retiree_wallet.toLowerCase(),
        token_id:        value.token_id,
        amount:          value.amount,
        retirement_note: value.retirement_note || null,
        tx_hash:         value.tx_hash,
        block_number:    value.block_number || null,
        retired_at:      new Date(),
      })
      .returning('*')

    // Mark the carbon_credit record as retired
    await db('carbon_credits')
      .where({
        owner_wallet: value.retiree_wallet.toLowerCase(),
        token_id:     value.token_id,
        status:       'active',
      })
      .update({ status: 'retired' })

    res.status(201).json({
      message: 'Retirement recorded on ledger.',
      record,
    })
  } catch (err) { next(err) }
})

// ─── GET /certificate/:retirementId – retirement certificate ──────
router.get('/certificate/:retirementId', async (req, res, next) => {
  try {
    const record = await db('retirements')
      .where({ 'retirements.id': req.params.retirementId })
      .leftJoin('projects', 'retirements.project_id', 'projects.id')
      .select(
        'retirements.*',
        'projects.name as project_name',
        'projects.location',
        'projects.validator_badge',
        'projects.ndvi_score',
      )
      .first()

    if (!record) return res.status(404).json({ error: 'Retirement record not found.' })

    res.json({
      certificate: {
        id:              record.id,
        type:            'Carbon Offset Certificate',
        standard:        record.validator_badge || 'CarbonX Registry',
        project_name:    record.project_name,
        location:        record.location,
        amount_tons:     record.amount,
        token_id:        record.token_id,
        retiree_wallet:  record.retiree_wallet,
        retirement_note: record.retirement_note,
        tx_hash:         record.tx_hash,
        block_number:    record.block_number,
        chain:           'Polygon Mainnet (Chain ID: 137)',
        contract_type:   'ERC-1155',
        retired_at:      record.retired_at,
        ndvi_score:      record.ndvi_score,
        explorer_url:    `https://www.oklink.com/polygon/tx/${record.tx_hash}`,
      },
    })
  } catch (err) { next(err) }
})

module.exports = router

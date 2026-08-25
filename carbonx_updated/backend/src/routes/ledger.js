/**
 * CarbonX Ledger Routes — /api/v1/ledger
 * List retirements (public), retire credits (auth required)
 */
const router = require('express').Router()
const Joi    = require('joi')
const { v4: uuidv4 } = require('uuid')
const db     = require('../db/client')
const { requireAuth } = require('../middleware/auth')
const email  = require('../services/emailService')

const retireSchema = Joi.object({
  project_id:  Joi.string().uuid().required(),
  token_id:    Joi.number().integer().min(1001).max(9999).required(),
  amount:      Joi.number().min(1).max(100000).required(),
  note:        Joi.string().min(5).max(500).trim().required(),
})

// GET /api/v1/ledger — public
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, project_id } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    let query = db('retirements as r')
      .join('projects as p',  'r.project_id', 'p.id')
      .join('users as u',     'r.user_id',    'u.id')
      .select(
        'r.id','r.token_id','r.amount','r.note','r.tx_hash',
        'r.created_at','r.retirement_id',
        'p.name as project_name','p.validator_badge',
        'u.full_name as user_name',
      )
      .orderBy('r.created_at', 'desc')
      .limit(Math.min(parseInt(limit), 100))
      .offset(offset)

    if (project_id) query = query.where('r.project_id', project_id)

    const [retirements, [{ count }]] = await Promise.all([
      query,
      db('retirements').count('id as count'),
    ])

    res.json({ retirements, total: parseInt(count), page: parseInt(page) })
  } catch (err) { next(err) }
})

// POST /api/v1/ledger/retire
router.post('/retire', requireAuth, async (req, res, next) => {
  try {
    const { error, value } = retireSchema.validate(req.body)
    if (error) return res.status(422).json({ error: error.details[0].message })

    const project = await db('projects').where({ id: value.project_id }).first()
    if (!project) return res.status(404).json({ error: 'Project not found.' })

    const retirementId = `CX-RET-${Date.now().toString(36).toUpperCase()}`
    const [retirement] = await db('retirements').insert({
      id:            uuidv4(),
      retirement_id: retirementId,
      user_id:       req.user.id,
      project_id:    value.project_id,
      token_id:      value.token_id,
      amount:        value.amount,
      note:          value.note,
      tx_hash:       null,
      created_at:    new Date(),
    }).returning('*')

    const user = await db('users').where({ id: req.user.id }).first()
    if (user) {
      email.sendRetirementEmail({
        email:        user.email,
        fullName:     user.full_name,
        project:      project.name,
        amount:       value.amount,
        note:         value.note,
        txHash:       null,
        retirementId: retirementId,
      }).catch(() => {})
    }

    return res.status(201).json({ message: 'Credits retired successfully.', retirement })
  } catch (err) { next(err) }
})

module.exports = router

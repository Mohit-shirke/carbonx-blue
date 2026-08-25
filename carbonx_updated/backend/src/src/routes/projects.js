/**
 * /api/v1/projects – Carbon project registry CRUD
 * NGOs propose, Validators verify, all users can read
 */

const router = require('express').Router()
const Joi    = require('joi')
const { v4: uuidv4 } = require('uuid')
const db     = require('../db/client')
const { requireAuth, requireRole, optionalAuth } = require('../middleware/auth')

// ─── Schemas ──────────────────────────────────────────────────────
const createSchema = Joi.object({
  name:            Joi.string().min(3).max(255).required(),
  description:     Joi.string().max(2000).optional().allow(''),
  location:        Joi.string().max(255).optional(),
  coordinates:     Joi.string().max(100).optional(),
  area_sq_km:      Joi.number().min(0.1).max(100_000).optional(),
  validator_badge: Joi.string().valid('Verra', 'CCTS', 'Gold Standard').optional(),
  target_credits:  Joi.number().integer().min(1).required(),
  price_per_ton_usd: Joi.number().min(0.01).max(10_000).optional(),
  metadata_uri:    Joi.string().max(512).optional(),
})

// ─── GET /  – list all projects ───────────────────────────────────
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { status, validator_badge, limit = 50, offset = 0 } = req.query

    let query = db('projects')
      .leftJoin('users', 'projects.proposer_id', 'users.id')
      .select(
        'projects.*',
        'users.full_name as proposer_name',
        db.raw("COALESCE(projects.issued_credits::float / NULLIF(projects.target_credits, 0), 0) as fulfillment_ratio")
      )
      .orderBy('projects.created_at', 'desc')
      .limit(Math.min(parseInt(limit), 100))
      .offset(parseInt(offset))

    if (status)          query = query.where('projects.status', status)
    if (validator_badge) query = query.where('projects.validator_badge', validator_badge)

    const [projects, [{ count }]] = await Promise.all([
      query,
      db('projects').count('id as count'),
    ])

    res.json({ projects, total: parseInt(count) })
  } catch (err) { next(err) }
})

// ─── GET /:id ─────────────────────────────────────────────────────
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const project = await db('projects')
      .where({ 'projects.id': req.params.id })
      .leftJoin('users', 'projects.proposer_id', 'users.id')
      .select('projects.*', 'users.full_name as proposer_name', 'users.email as proposer_email')
      .first()

    if (!project) return res.status(404).json({ error: 'Project not found.' })

    // Fetch MRV logs for this project
    const mrvLogs = await db('mrv_logs')
      .where({ project_id: req.params.id })
      .orderBy('created_at', 'desc')
      .limit(5)

    res.json({ project, mrv_logs: mrvLogs })
  } catch (err) { next(err) }
})

// ─── POST / – propose new project (NGO only) ─────────────────────
router.post('/', requireAuth, requireRole('ngo'), async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body, { abortEarly: false })
    if (error) return res.status(422).json({ error: 'Validation failed', details: error.details.map(d => d.message) })

    const [project] = await db('projects')
      .insert({
        id:          uuidv4(),
        ...value,
        proposer_id: req.user.id,
        status:      'proposed',
      })
      .returning('*')

    res.status(201).json({ message: 'Project proposed successfully.', project })
  } catch (err) { next(err) }
})

// ─── PATCH /:id/verify – government validates ─────────────────────
router.patch('/:id/verify', requireAuth, requireRole('government'), async (req, res, next) => {
  try {
    const project = await db('projects').where({ id: req.params.id }).first()
    if (!project) return res.status(404).json({ error: 'Project not found.' })
    if (project.status === 'verified') return res.status(409).json({ error: 'Already verified.' })

    const [updated] = await db('projects')
      .where({ id: req.params.id })
      .update({ status: 'verified', verified_at: new Date() })
      .returning('*')

    res.json({ message: 'Project verified.', project: updated })
  } catch (err) { next(err) }
})

// ─── PATCH /:id – update project metadata (proposer only) ─────────
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const project = await db('projects').where({ id: req.params.id }).first()
    if (!project) return res.status(404).json({ error: 'Project not found.' })

    // Only the proposer or an admin (government) can edit
    if (project.proposer_id !== req.user.id && req.user.assigned_role !== 'government') {
      return res.status(403).json({ error: 'You do not have permission to edit this project.' })
    }

    const allowedFields = ['description', 'metadata_uri', 'price_per_ton_usd', 'area_sq_km']
    const updates = {}
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f] })

    const [updated] = await db('projects').where({ id: req.params.id }).update(updates).returning('*')
    res.json({ message: 'Project updated.', project: updated })
  } catch (err) { next(err) }
})

// ─── DELETE /:id – soft-delete (government only) ──────────────────
router.delete('/:id', requireAuth, requireRole('government'), async (req, res, next) => {
  try {
    const project = await db('projects').where({ id: req.params.id }).first()
    if (!project) return res.status(404).json({ error: 'Project not found.' })

    await db('projects').where({ id: req.params.id }).update({ status: 'rejected' })
    res.json({ message: 'Project rejected and removed from active listings.' })
  } catch (err) { next(err) }
})

module.exports = router

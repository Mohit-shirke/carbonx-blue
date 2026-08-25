/**
 * /api/v1/mrv – AI MRV pipeline simulation routes
 * Streams step-by-step telemetry to client via Server-Sent Events (SSE)
 * Updates project status to VERIFIED on completion
 */

const router = require('express').Router()
const Joi    = require('joi')
const crypto = require('crypto')
const db     = require('../db/client')
const { requireAuth, requireRole } = require('../middleware/auth')

// ─── Pipeline step definitions ────────────────────────────────────
const PIPELINE_STEPS = [
  { delayMs: 0,    message: '[0.0s] Ingesting Copernicus Sentinel-2 Multispectral Raster Matrix...', level: 'INFO' },
  { delayMs: 800,  message: '[0.8s] Authenticating ESA Open Access Hub session... Tile acquisition: T44QKF.', level: 'INFO' },
  { delayMs: 1500, message: '[1.5s] Executing Spatial Convolution Filters... Mapping Chlorophyll Absorption bands...', level: 'PROCESSING' },
  { delayMs: 2200, message: '[2.2s] Band B8 (NIR) normalization complete. Band B4 (Red) contrast stretched to 10m/px resolution.', level: 'INFO' },
  { delayMs: 2800, message: '[2.8s] Applying atmospheric correction via Sen2Cor processor... Aerosol optical depth: 0.12.', level: 'PROCESSING' },
  { delayMs: 3000, message: '[3.0s] NDVI Biomass Index calculated at 0.84. Canopy coverage checks match NGO specifications.', level: 'PROCESSING' },
  { delayMs: 3500, message: '[3.5s] Cross-referencing historical imagery stack (2020–2025)... Deforestation delta: 0.2%. PASS.', level: 'INFO' },
  { delayMs: 3800, message: '[3.8s] Carbon stock estimation: 842.3 tC/ha above-ground biomass. Below-ground: 30% AGB factor applied.', level: 'INFO' },
  { delayMs: 4000, message: '[4.0s] Verification Matrix Approved. Generating cryptographic validation signature...', level: 'SUCCESS' },
  { delayMs: 4500, message: '[4.5s] ✓ Validation complete. Project status updated to VERIFIED. ERC-1155 mint authorized.', level: 'SUCCESS' },
]

// ─── POST /analyze ────────────────────────────────────────────────
// Streaming SSE endpoint that simulates satellite MRV pipeline
router.post('/analyze', requireAuth, requireRole('government', 'academic'), async (req, res, next) => {
  const { project_id } = req.body

  if (!project_id) {
    return res.status(422).json({ error: 'project_id is required.' })
  }

  const project = await db('projects').where({ id: project_id }).first()
  if (!project) return res.status(404).json({ error: 'Project not found.' })
  if (project.status === 'verified') {
    return res.status(409).json({ error: 'Project is already verified.' })
  }

  // ── SSE headers ─────────────────────────────────────────────────
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no') // Nginx: disable buffering
  res.flushHeaders()

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
    // Force flush for Node streams
    if (res.flush) res.flush()
  }

  // Update project status to pending_mrv
  await db('projects').where({ id: project_id }).update({ status: 'pending_mrv' })
  sendEvent({ type: 'STATUS', message: 'Pipeline initiated. Project status → PENDING_MRV.' })

  // Stream pipeline steps with delays
  let totalDelay = 0
  for (const step of PIPELINE_STEPS) {
    await new Promise(resolve => setTimeout(resolve, step.delayMs - totalDelay + (totalDelay === 0 ? 0 : 0)))
    totalDelay = step.delayMs
    await new Promise(resolve => setTimeout(resolve, step.delayMs === 0 ? 0 : 400))
    sendEvent({ type: 'LOG', level: step.level, message: step.message, timestamp: new Date().toISOString() })
  }

  // ── Finalize ─────────────────────────────────────────────────────
  try {
    const ndviScore = 0.84
    const validationSig = crypto
      .createHash('sha256')
      .update(`${project_id}:${ndviScore}:${Date.now()}`)
      .digest('hex')

    // Update project to verified
    await db('projects').where({ id: project_id }).update({
      status:     'verified',
      ndvi_score: ndviScore,
      verified_at: new Date(),
    })

    // Create MRV log record
    await db('mrv_logs').insert({
      project_id,
      validator_id:         req.user.id,
      result:               'approved',
      ndvi_score:           ndviScore,
      pipeline_output:      JSON.stringify(PIPELINE_STEPS),
      validation_signature: validationSig,
    })

    sendEvent({
      type:       'COMPLETE',
      success:    true,
      ndvi_score: ndviScore,
      signature:  validationSig.slice(0, 20) + '...',
      message:    'MRV pipeline complete. Project verified on-chain.',
    })
  } catch (err) {
    sendEvent({ type: 'ERROR', message: `Pipeline finalization failed: ${err.message}` })
  }

  res.end()
})

// ─── GET /logs/:projectId ─────────────────────────────────────────
router.get('/logs/:projectId', requireAuth, async (req, res, next) => {
  try {
    const logs = await db('mrv_logs')
      .where({ project_id: req.params.projectId })
      .join('users', 'mrv_logs.validator_id', 'users.id')
      .select('mrv_logs.*', 'users.full_name as validator_name', 'users.email as validator_email')
      .orderBy('mrv_logs.created_at', 'desc')

    res.json({ logs })
  } catch (err) {
    next(err)
  }
})

// ─── GET /queue ───────────────────────────────────────────────────
// Returns projects pending MRV validation
router.get('/queue', requireAuth, requireRole('government', 'academic'), async (req, res, next) => {
  try {
    const queue = await db('projects')
      .whereIn('status', ['proposed', 'pending_mrv'])
      .leftJoin('users', 'projects.proposer_id', 'users.id')
      .select(
        'projects.*',
        'users.full_name as proposer_name',
        'users.email as proposer_email'
      )
      .orderBy('projects.created_at', 'asc')

    res.json({ queue, count: queue.length })
  } catch (err) {
    next(err)
  }
})

module.exports = router

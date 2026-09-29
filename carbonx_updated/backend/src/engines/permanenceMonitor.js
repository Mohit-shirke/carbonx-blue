/**
 * CarbonX Permanence & Reversal Monitoring Engine
 * Detects biomass decline, storm damage, deforestation events
 * Required by: Verra VM0033, Isometric Mangrove Protocol v1.0, ICVCM CCPs
 * 
 * Monitors: NDVI change, cyclone events, encroachment, pollution
 */

const { v4: uuidv4 } = require('uuid')

// ── Reversal Detection Thresholds ─────────────────────────────────
const THRESHOLDS = {
  NDVI_MINOR_DECLINE:    0.05,  // 5%  drop  → Warning
  NDVI_MODERATE_DECLINE: 0.10,  // 10% drop  → Alert — investigate
  NDVI_MAJOR_DECLINE:    0.20,  // 20% drop  → Critical — reversal likely
  NDVI_CATASTROPHIC:     0.35,  // 35% drop  → Reversal confirmed — credits invalidated
  AREA_LOSS_WARNING:     0.03,  // 3%  area  → Warning
  AREA_LOSS_ALERT:       0.08,  // 8%  area  → Alert
  AREA_LOSS_CRITICAL:    0.15,  // 15% area  → Critical reversal event
}

// ── Risk Factor Weights (Isometric Protocol §4.3) ──────────────────
const RISK_WEIGHTS = {
  cyclone_frequency:     { label:'Cyclone/storm frequency',     max: 30 },
  sea_level_rise:        { label:'Sea level rise exposure',     max: 20 },
  human_encroachment:    { label:'Human encroachment pressure', max: 20 },
  pollution_risk:        { label:'Pollution & sedimentation',   max: 15 },
  erosion_risk:          { label:'Coastal erosion risk',        max: 10 },
  fire_risk:             { label:'Wildfire risk (rare)',         max:  5 },
}

/**
 * Calculate non-permanence risk rating
 * Returns buffer pool contribution required (%)
 * Based on Verra VM0033 Non-Permanence Risk Tool
 */
function calculateNonPermanenceRisk(projectData) {
  const {
    cyclone_frequency    = 2,   // Events per 10 years
    sea_level_projection = 3.5, // mm/yr
    encroachment_pressure= 'medium',
    pollution_index      = 0.3,
    erosion_rate_m_yr    = 0.5,
    ndvi_trend_5yr       = 0.01, // Annual NDVI change (positive = improving)
    fire_risk_zone       = false,
    region               = 'india',
  } = projectData

  const scores = {}

  // Cyclone risk (0–30 points)
  scores.cyclone = Math.min(cyclone_frequency * 4, 30)

  // Sea level rise risk (0–20 points)
  scores.sea_level = Math.min((sea_level_projection / 10) * 20, 20)

  // Human encroachment (0–20 points)
  const enc = { low: 5, medium: 12, high: 20 }
  scores.encroachment = enc[encroachment_pressure] || 12

  // Pollution (0–15 points)
  scores.pollution = Math.min(pollution_index * 15, 15)

  // Erosion (0–10 points)
  scores.erosion = Math.min(erosion_rate_m_yr * 10, 10)

  // Fire risk (0–5 points) — rare for mangroves
  scores.fire = fire_risk_zone ? 3 : 0

  const total = Object.values(scores).reduce((s, v) => s + v, 0)

  // Risk rating and buffer requirement
  let rating, buffer_pct, label
  if (total <= 15) { rating = 'LOW';          buffer_pct = 0.10; label = 'Low permanence risk' }
  else if (total <= 30) { rating = 'MEDIUM';  buffer_pct = 0.15; label = 'Moderate permanence risk' }
  else if (total <= 50) { rating = 'HIGH';    buffer_pct = 0.22; label = 'High permanence risk' }
  else                  { rating = 'CRITICAL';buffer_pct = 0.30; label = 'Very high permanence risk' }

  // Bonus: improving NDVI trend reduces buffer
  if (ndvi_trend_5yr > 0.02) buffer_pct = Math.max(buffer_pct - 0.02, 0.10)

  return {
    total_risk_score: +total.toFixed(1),
    max_possible:     100,
    rating,
    buffer_required_pct: +(buffer_pct * 100).toFixed(1),
    label,
    scores,
    tool: 'VM0033_Non_Permanence_Risk_Tool_v2',
    timestamp: new Date().toISOString(),
  }
}

/**
 * Analyze NDVI time series for reversal events
 * Compares current vs historical NDVI readings
 */
function analyzeNDVITimeSeries(readings) {
  if (!readings || readings.length < 2) return null

  const sorted  = [...readings].sort((a, b) => new Date(a.date) - new Date(b.date))
  const latest  = sorted[sorted.length - 1]
  const prev    = sorted[sorted.length - 2]
  const baseline= sorted[0]
  const peak    = sorted.reduce((max, r) => r.ndvi > max.ndvi ? r : max, sorted[0])

  const change_from_prev     = latest.ndvi - prev.ndvi
  const change_from_baseline = latest.ndvi - baseline.ndvi
  const change_from_peak     = latest.ndvi - peak.ndvi
  const pct_change_from_peak = (change_from_peak / peak.ndvi) * 100

  // Detect reversal events
  const alerts = []

  if (Math.abs(change_from_prev) > THRESHOLDS.NDVI_MAJOR_DECLINE) {
    alerts.push({
      type:     'MAJOR_DECLINE',
      severity: 'CRITICAL',
      message:  `NDVI dropped ${Math.abs(change_from_prev).toFixed(3)} from previous reading. Potential reversal event.`,
      action:   'Immediate investigation required. Initiate reversal assessment protocol.',
      ndvi_change: change_from_prev,
    })
  } else if (Math.abs(change_from_prev) > THRESHOLDS.NDVI_MODERATE_DECLINE) {
    alerts.push({
      type:     'MODERATE_DECLINE',
      severity: 'HIGH',
      message:  `NDVI dropped ${Math.abs(change_from_prev).toFixed(3)}. Monitoring elevated.`,
      action:   'Schedule field investigation within 30 days.',
      ndvi_change: change_from_prev,
    })
  } else if (Math.abs(change_from_prev) > THRESHOLDS.NDVI_MINOR_DECLINE) {
    alerts.push({
      type:     'MINOR_DECLINE',
      severity: 'WARNING',
      message:  `Minor NDVI decline of ${Math.abs(change_from_prev).toFixed(3)} detected.`,
      action:   'Continue monitoring. Review at next scheduled MRV.',
      ndvi_change: change_from_prev,
    })
  }

  return {
    latest_ndvi:            +latest.ndvi.toFixed(3),
    baseline_ndvi:          +baseline.ndvi.toFixed(3),
    peak_ndvi:              +peak.ndvi.toFixed(3),
    change_from_baseline:   +change_from_baseline.toFixed(3),
    change_from_peak:       +change_from_peak.toFixed(3),
    pct_change_from_peak:   +pct_change_from_peak.toFixed(1),
    trend:                  change_from_baseline > 0 ? 'improving' : change_from_baseline < -0.05 ? 'declining' : 'stable',
    alerts,
    reversal_risk:          alerts.some(a => a.severity === 'CRITICAL'),
    data_points:            readings.length,
  }
}

/**
 * Generate reversal event report
 * Required by Verra VM0033 §8.2 and Isometric Protocol §5.3
 */
function generateReversalReport({ project, ndviAnalysis, estimatedLossHa }) {
  const reversalTonnes = estimatedLossHa * 8.5 // tCO2e/ha average for mangroves

  return {
    report_id:       `REV-${Date.now().toString(36).toUpperCase()}`,
    project_id:      project.id,
    project_name:    project.name,
    event_type:      ndviAnalysis.alerts[0]?.type || 'MONITORING_UPDATE',
    severity:        ndviAnalysis.alerts[0]?.severity || 'INFO',
    detected_at:     new Date().toISOString(),
    estimated_loss: {
      hectares:     +estimatedLossHa.toFixed(2),
      co2e_tonnes:  +reversalTonnes.toFixed(2),
    },
    ndvi_analysis:   ndviAnalysis,
    required_actions: [
      'Notify project developer within 5 business days',
      'Initiate field verification if loss > 5% area',
      'Withdraw credits from buffer pool = estimated loss',
      'File reversal report with certification body',
      'Suspend new credit issuance pending investigation',
    ],
    buffer_withdrawal: {
      tonnes_required: +reversalTonnes.toFixed(2),
      action:         'WITHDRAW_FROM_BUFFER_POOL',
    },
  }
}

module.exports = {
  calculateNonPermanenceRisk,
  analyzeNDVITimeSeries,
  generateReversalReport,
  THRESHOLDS,
}

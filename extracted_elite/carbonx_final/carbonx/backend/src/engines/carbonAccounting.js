/**
 * CarbonX Carbon Accounting Engine
 * Implements IPCC Tier 2 allometric equations for mangrove blue carbon
 * Based on: BEE BM FR05.001, Verra VM0033, Isometric Mangrove Protocol v1.0
 * 
 * Formula: Net Removals = Project Removals - Baseline Removals - Leakage ± Uncertainty
 */

// ── IPCC Tier 2 Biomass Conversion Factors ────────────────────────
// Source: IPCC 2013 Wetlands Supplement, Chapter 4
const IPCC = {
  // Above-ground biomass density for mangroves by region (t dry matter/ha)
  mangrove: {
    india_sundarbans:    { agb: 131.2, bgb_ratio: 0.49, carbon_fraction: 0.451 },
    india_andaman:       { agb: 142.8, bgb_ratio: 0.52, carbon_fraction: 0.451 },
    india_gujarat:       { agb:  98.4, bgb_ratio: 0.44, carbon_fraction: 0.451 },
    india_odisha:        { agb: 118.6, bgb_ratio: 0.47, carbon_fraction: 0.451 },
    india_tamilnadu:     { agb: 108.9, bgb_ratio: 0.45, carbon_fraction: 0.451 },
    india_andhra:        { agb: 124.3, bgb_ratio: 0.48, carbon_fraction: 0.451 },
    default:             { agb: 120.0, bgb_ratio: 0.47, carbon_fraction: 0.451 },
  },
  seagrass: {
    default: { agb: 2.5, bgb_ratio: 2.0, carbon_fraction: 0.34, soil_c: 139.7 }
  },
  wetland: {
    default: { agb: 8.0, bgb_ratio: 0.8, carbon_fraction: 0.44, soil_c: 255.0 }
  },
  // CO2 to C conversion
  CO2_TO_C:   0.2727,
  C_TO_CO2:   3.6667,
  // Soil carbon for mangroves (tC/ha)
  SOIL_C_MANGROVE: 255.0,
  // Default degradation factor for baseline
  BASELINE_DEGRADATION_RATE: 0.015, // 1.5%/yr typical for Indian coast
}

// ── BEE BM FR05.001 Net Removal Formula ──────────────────────────
/**
 * Calculate net anthropogenic removals (tCO2e/ha/yr)
 * Formula: NetRemovals = ProjectRemovals - BaselineRemovals - Leakage - Uncertainty
 *
 * @param {object} params Project parameters
 * @returns {object} Complete carbon accounting result
 */
function calculateNetRemovals(params) {
  const {
    ecosystem        = 'mangrove',
    region           = 'default',
    area_ha,                           // Project area in hectares
    ndvi_score,                        // Current NDVI from satellite
    baseline_ndvi    = 0.35,           // Pre-project NDVI (degraded state)
    project_age_yr   = 1,              // Years since project start
    leakage_fraction = 0.10,           // Default 10% leakage (BEE BM FR05.001)
    uncertainty_pct  = 0.15,           // Default 15% uncertainty discount
    soil_depth_m     = 0.30,           // Soil carbon depth (m)
    methodology      = 'BEE_BM_FR05_001',
  } = params

  // Validate inputs
  if (!area_ha || area_ha <= 0) throw new Error('area_ha must be positive')
  if (!ndvi_score || ndvi_score <= 0) throw new Error('ndvi_score is required')
  if (ndvi_score < baseline_ndvi) throw new Error('Project NDVI must exceed baseline NDVI')

  const factors = IPCC[ecosystem]?.[region] || IPCC[ecosystem]?.default || IPCC.mangrove.default

  // ── Step 1: Above-ground biomass carbon (tC/ha) ───────────────
  // Using NDVI-biomass relationship calibrated for Indian mangroves
  // AGB = Base_AGB × (NDVI_project / NDVI_baseline_healthy)
  const ndvi_healthy = 0.85 // Reference NDVI for fully healthy mangrove
  const agb_project  = factors.agb * (ndvi_score / ndvi_healthy)
  const agb_baseline = factors.agb * (baseline_ndvi / ndvi_healthy)

  // ── Step 2: Below-ground biomass (roots) ──────────────────────
  const bgb_project  = agb_project  * factors.bgb_ratio
  const bgb_baseline = agb_baseline * factors.bgb_ratio

  // ── Step 3: Total biomass carbon per hectare ──────────────────
  const tbc_project  = (agb_project  + bgb_project)  * factors.carbon_fraction
  const tbc_baseline = (agb_baseline + bgb_baseline) * factors.carbon_fraction

  // ── Step 4: Soil organic carbon (tC/ha) ──────────────────────
  // BM FR05.001 requires soil C where significantly affected
  const soil_bulk_density = 0.27  // t/m³ typical for mangrove soils
  const soil_c_pct        = 0.065 // 6.5% organic carbon typical
  const soc_project  = soil_depth_m * soil_bulk_density * soil_c_pct * area_ha * 10000 / area_ha
  const soc_baseline = soc_project * (baseline_ndvi / ndvi_score) // Degraded baseline

  // ── Step 5: Total project carbon stock change (tC/ha/yr) ──────
  const project_removal_c_ha = (tbc_project  + soc_project)  / project_age_yr
  const baseline_removal_c_ha= (tbc_baseline + soc_baseline) / project_age_yr

  // ── Step 6: Convert to CO2e ───────────────────────────────────
  const project_co2e_ha  = project_removal_c_ha  * IPCC.C_TO_CO2
  const baseline_co2e_ha = baseline_removal_c_ha * IPCC.C_TO_CO2

  // ── Step 7: Net removal before leakage & uncertainty ─────────
  const gross_removal_ha = project_co2e_ha - baseline_co2e_ha

  // ── Step 8: Total for project area ────────────────────────────
  const gross_removal_total = gross_removal_ha * area_ha

  // ── Step 9: Leakage deduction (BEE BM FR05.001 §7) ───────────
  // Leakage = displaced agricultural activity, fishing pressure shifts
  const leakage_total = gross_removal_total * leakage_fraction

  // ── Step 10: Net removals before uncertainty ──────────────────
  const net_before_uncertainty = gross_removal_total - leakage_total

  // ── Step 11: Uncertainty deduction (IPCC Tier 2 conservative) ─
  // Apply percentage uncertainty as conservative discount
  const uncertainty_deduction = net_before_uncertainty * uncertainty_pct
  const net_removal_total      = net_before_uncertainty - uncertainty_deduction

  // ── Step 12: Buffer pool contribution (Verra: 10-20%) ─────────
  const buffer_pool_pct          = calculateBufferPercentage(params)
  const buffer_contribution      = net_removal_total * buffer_pool_pct
  const creditable_removal_total = net_removal_total - buffer_contribution

  // ── Step 13: Annual creditable tonnes ────────────────────────
  const creditable_tonnes_yr = creditable_removal_total / project_age_yr

  return {
    methodology,
    inputs: {
      ecosystem, region, area_ha, ndvi_score, baseline_ndvi,
      project_age_yr, leakage_fraction, uncertainty_pct, soil_depth_m,
    },
    calculation: {
      // Per hectare values
      agb_project_tha:          +agb_project.toFixed(2),
      agb_baseline_tha:         +agb_baseline.toFixed(2),
      bgb_project_tha:          +bgb_project.toFixed(2),
      bgb_baseline_tha:         +bgb_baseline.toFixed(2),
      total_biomass_c_project:  +tbc_project.toFixed(2),
      total_biomass_c_baseline: +tbc_baseline.toFixed(2),
      soc_project_tha:          +soc_project.toFixed(2),
      soc_baseline_tha:         +soc_baseline.toFixed(2),
      // Removal estimates
      project_co2e_ha_yr:       +project_co2e_ha.toFixed(3),
      baseline_co2e_ha_yr:      +baseline_co2e_ha.toFixed(3),
      gross_removal_ha_yr:      +gross_removal_ha.toFixed(3),
      gross_removal_total:      +gross_removal_total.toFixed(2),
      leakage_deduction:        +leakage_total.toFixed(2),
      uncertainty_deduction:    +uncertainty_deduction.toFixed(2),
      net_removal_total:        +net_removal_total.toFixed(2),
      buffer_pool_pct:          +(buffer_pool_pct * 100).toFixed(1),
      buffer_contribution:      +buffer_contribution.toFixed(2),
      creditable_removal_total: +creditable_removal_total.toFixed(2),
      creditable_tonnes_yr:     +creditable_tonnes_yr.toFixed(2),
    },
    // Summary (what gets minted as credits)
    result: {
      gross_co2e_tonnes:       +gross_removal_total.toFixed(2),
      net_co2e_tonnes:         +net_removal_total.toFixed(2),
      creditable_co2e_tonnes:  +creditable_removal_total.toFixed(2),
      annual_credits:          +creditable_tonnes_yr.toFixed(2),
      co2e_per_hectare_yr:     +(creditable_removal_total / area_ha / project_age_yr).toFixed(3),
    },
    confidence: calculateConfidence(params, ndvi_score),
    timestamp: new Date().toISOString(),
  }
}

/**
 * Calculate buffer pool percentage based on risk factors
 * Verra VM0033 / Isometric Protocol: typically 10–30%
 */
function calculateBufferPercentage({ ecosystem, ndvi_score, region }) {
  let buffer = 0.10 // Base 10%
  // Higher buffer for degraded ecosystems
  if (ndvi_score < 0.70) buffer += 0.05
  if (ndvi_score < 0.60) buffer += 0.05
  // Regional risk adjustment
  if (region?.includes('gujarat')) buffer += 0.05 // Higher cyclone risk
  if (region?.includes('andaman')) buffer += 0.03
  // Ecosystem risk
  if (ecosystem === 'seagrass') buffer += 0.05 // Higher reversal risk
  return Math.min(buffer, 0.30) // Cap at 30%
}

/**
 * Calculate scientific confidence score
 * Based on data quality, NDVI reliability, and methodology alignment
 */
function calculateConfidence({ ndvi_score, area_ha, project_age_yr }) {
  let score = 100
  if (ndvi_score < 0.75)   score -= 10
  if (ndvi_score < 0.65)   score -= 10
  if (area_ha < 10)        score -= 5  // Small area = higher edge effects
  if (project_age_yr < 2)  score -= 10 // Short project = higher uncertainty
  if (project_age_yr >= 5) score += 5  // Long track record
  return {
    score:    Math.max(score, 50),
    rating:   score >= 90 ? 'High' : score >= 75 ? 'Medium' : 'Low',
    notes:    [
      ndvi_score >= 0.80 ? '✅ NDVI above verification threshold' : '⚠️ NDVI below 0.80 — review required',
      area_ha >= 100     ? '✅ Sufficient area for reliable estimates' : '⚠️ Small area — higher spatial uncertainty',
      project_age_yr >= 2? '✅ Sufficient project history' : '⚠️ Young project — recommend re-verification at year 2',
    ],
  }
}

/**
 * Validate methodology applicability (BEE BM FR05.001 §4)
 * Returns pass/fail with reasons
 */
function validateMethodologyApplicability(projectData) {
  const checks = []
  const { ecosystem, ndvi_score, area_ha, is_degraded, mangrove_species_pct, has_community_agreement, additionality_score } = projectData

  // BEE BM FR05.001 applicability conditions
  checks.push({ rule: 'Ecosystem type', pass: ecosystem === 'mangrove', detail: `Ecosystem: ${ecosystem}. BM FR05.001 applies to mangrove A/R only.` })
  checks.push({ rule: 'Degraded habitat', pass: !!is_degraded, detail: 'Project area must be degraded mangrove habitat per BM FR05.001 §4.1' })
  checks.push({ rule: 'Species composition', pass: (mangrove_species_pct || 0) >= 90, detail: `${mangrove_species_pct || 0}% mangrove species. Requires >90% per BM FR05.001 §4.3` })
  checks.push({ rule: 'Minimum area', pass: area_ha >= 0.1, detail: `${area_ha} ha. Minimum 0.1 ha required.` })
  checks.push({ rule: 'Community safeguards', pass: !!has_community_agreement, detail: 'Community consultation and agreement required for ICVCM compliance' })
  checks.push({ rule: 'Additionality', pass: (additionality_score || 0) >= 60, detail: `Additionality score: ${additionality_score || 0}/100. Minimum 60 required.` })
  checks.push({ rule: 'NDVI baseline', pass: (ndvi_score || 0) >= 0.65, detail: `NDVI: ${ndvi_score}. Minimum 0.65 for project-grade mangrove.` })

  const passed = checks.filter(c => c.pass).length
  const failed = checks.filter(c => !c.pass)

  return {
    applicable:     failed.length === 0,
    score:          Math.round((passed / checks.length) * 100),
    checks,
    hard_rejections: failed.filter(c => ['Ecosystem type','Additionality','Species composition'].includes(c.rule)),
    methodology:    'BEE BM FR05.001',
    standard:       'India CCTS',
  }
}

/**
 * Calculate project readiness score (0–100)
 * Determines if CarbonX accepts or advances a project
 */
function calculateProjectReadinessScore(projectData) {
  const weights = {
    legal_rights:         { score: projectData.legal_rights_score     || 0, weight: 0.20, label: 'Legal rights & land tenure' },
    additionality:        { score: projectData.additionality_score     || 0, weight: 0.20, label: 'Additionality demonstration' },
    methodology_fit:      { score: projectData.methodology_score       || 0, weight: 0.15, label: 'Methodology applicability' },
    ecological_feasibility:{ score: projectData.ecology_score          || 0, weight: 0.10, label: 'Ecological feasibility' },
    mrv_completeness:     { score: projectData.mrv_score               || 0, weight: 0.10, label: 'MRV data completeness' },
    community_safeguards: { score: projectData.community_score         || 0, weight: 0.10, label: 'Community safeguards' },
    permanence:           { score: projectData.permanence_score        || 0, weight: 0.05, label: 'Permanence & reversal risk' },
    leakage:              { score: projectData.leakage_score           || 0, weight: 0.05, label: 'Leakage risk assessment' },
    data_quality:         { score: projectData.data_quality_score      || 0, weight: 0.05, label: 'Data quality & integrity' },
  }

  const total = Object.values(weights).reduce((sum, w) => sum + (w.score * w.weight), 0)

  const gate = total >= 80 ? 'ADVANCE' : total >= 60 ? 'CONDITIONAL' : total >= 40 ? 'REVIEW' : 'REJECT'

  return {
    total_score:  +total.toFixed(1),
    gate,
    breakdown:    weights,
    recommendation: {
      ADVANCE:     'Project passes all gates. Proceed to ACVA validation submission.',
      CONDITIONAL: 'Project needs improvement in flagged areas before ACVA submission.',
      REVIEW:      'Significant gaps identified. Return to NGO for remediation.',
      REJECT:      'Project fails critical eligibility criteria. Cannot proceed.',
    }[gate],
    hard_rejects: Object.entries(weights)
      .filter(([k, v]) => ['legal_rights','additionality'].includes(k) && v.score < 40)
      .map(([k, v]) => v.label),
  }
}

module.exports = { calculateNetRemovals, validateMethodologyApplicability, calculateProjectReadinessScore, calculateBufferPercentage }

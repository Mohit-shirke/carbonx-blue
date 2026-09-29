/**
 * CarbonX Uncertainty Propagation Engine
 * Implements IPCC 2006 Guidelines Volume 4 Chapter 3 — Uncertainty Analysis
 * Method 1 (Error Propagation) + Method 2 (Monte Carlo Simulation)
 * 
 * Reference: IPCC 2006 GL Vol 4 §3.2 — Approach 1: Simple Error Propagation
 * Used in: BEE BM FR05.001, Verra VM0033, Isometric Mangrove Protocol v1.0
 */

// ── IPCC Tier 2 default uncertainty values ────────────────────────
// Source: IPCC 2013 Wetlands Supplement Table 4.8
const DEFAULT_UNCERTAINTIES = {
  agb_biomass_expansion:   0.20, // 20% — typical for tropical mangroves
  bgb_ratio:               0.15, // 15% — root:shoot ratio uncertainty
  carbon_fraction:         0.05, // 5%  — wood carbon fraction
  soil_carbon_density:     0.35, // 35% — high variability in mangrove soils
  ndvi_biomass_correlation:0.18, // 18% — NDVI-to-biomass model uncertainty
  baseline_degradation:    0.25, // 25% — counterfactual scenario uncertainty
  leakage_estimate:        0.30, // 30% — activity shifting estimate
  area_measurement:        0.05, // 5%  — GPS boundary uncertainty
}

/**
 * IPCC Method 1 — Error Propagation (Addition/Subtraction)
 * For: Gross Removal = Sum of carbon pool changes
 * Formula: U_total = sqrt(sum((U_i * x_i)^2)) / |sum(x_i)|
 * 
 * @param {Array<{value: number, uncertainty_pct: number}>} components
 * @returns {object} Combined uncertainty result
 */
function propagateAdditionUncertainty(components) {
  // Filter valid components
  const valid = components.filter(c => c.value !== 0 && c.uncertainty_pct >= 0)
  if (valid.length === 0) return { combined_uncertainty_pct: 0, method: 'IPCC_M1_addition' }

  // Numerator: sqrt of sum of (uncertainty × value)^2
  const sumSquares = valid.reduce((sum, c) => {
    const absUncert = Math.abs(c.value) * (c.uncertainty_pct / 100)
    return sum + Math.pow(absUncert, 2)
  }, 0)

  const numerator   = Math.sqrt(sumSquares)
  const denominator = Math.abs(valid.reduce((sum, c) => sum + c.value, 0))

  if (denominator === 0) return { combined_uncertainty_pct: 0, method: 'IPCC_M1_addition' }

  const combined_pct = (numerator / denominator) * 100

  return {
    combined_uncertainty_pct: +combined_pct.toFixed(2),
    combined_uncertainty_abs: +numerator.toFixed(4),
    method:   'IPCC_Method_1_Error_Propagation',
    ipcc_ref: 'IPCC 2006 GL Vol 4 §3.2.1 Equation 3.1',
    components_count: valid.length,
  }
}

/**
 * IPCC Method 1 — Multiplication/Division error propagation
 * For: biomass × carbon_fraction × CO2_factor
 * Formula: U_product = sqrt(sum(U_i^2))  (add relative uncertainties in quadrature)
 * 
 * @param {Array<number>} relative_uncertainties — as fractions (0.20 = 20%)
 */
function propagateMultiplicationUncertainty(relative_uncertainties) {
  const sumSquares = relative_uncertainties.reduce((s, u) => s + Math.pow(u, 2), 0)
  const combined   = Math.sqrt(sumSquares)
  return {
    combined_uncertainty_pct: +(combined * 100).toFixed(2),
    method:   'IPCC_Method_1_Multiplication',
    ipcc_ref: 'IPCC 2006 GL Vol 4 §3.2.1 Equation 3.2',
  }
}

/**
 * Monte Carlo Uncertainty Simulation
 * Method 2 per IPCC 2006 GL Vol 4 §3.2.3
 * Uses Box-Muller transform for Gaussian sampling — O(n) space, O(n×k) time
 * n = parameters, k = iterations (default 10,000)
 * 
 * @param {object} carbonParams - Base carbon accounting parameters
 * @param {number} iterations   - Monte Carlo iterations (10,000 for publication-grade)
 */
function monteCarloUncertainty(carbonParams, iterations = 10000) {
  const {
    area_ha, ndvi_score, baseline_ndvi,
    agb_base = 120.0, bgb_ratio = 0.47,
    carbon_fraction = 0.451, leakage_fraction = 0.10,
  } = carbonParams

  // Box-Muller transform for Gaussian random numbers
  // Time complexity: O(1) per sample
  function gaussianRandom(mean, std) {
    let u = 0, v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    return mean + z * std
  }

  // Run Monte Carlo simulation
  const results = new Float64Array(iterations) // Typed array — memory efficient
  const ndvi_healthy = 0.85

  for (let i = 0; i < iterations; i++) {
    // Sample uncertain parameters from their distributions
    const agb_sample        = Math.max(0, gaussianRandom(agb_base,        agb_base        * DEFAULT_UNCERTAINTIES.agb_biomass_expansion))
    const bgb_ratio_sample  = Math.max(0, gaussianRandom(bgb_ratio,        bgb_ratio       * DEFAULT_UNCERTAINTIES.bgb_ratio))
    const cf_sample         = Math.max(0, gaussianRandom(carbon_fraction,  carbon_fraction * DEFAULT_UNCERTAINTIES.carbon_fraction))
    const ndvi_sample       = Math.max(0, Math.min(1, gaussianRandom(ndvi_score, ndvi_score * DEFAULT_UNCERTAINTIES.ndvi_biomass_correlation)))
    const baseline_sample   = Math.max(0, gaussianRandom(baseline_ndvi, baseline_ndvi * DEFAULT_UNCERTAINTIES.baseline_degradation))
    const leakage_sample    = Math.max(0, Math.min(0.5, gaussianRandom(leakage_fraction, leakage_fraction * DEFAULT_UNCERTAINTIES.leakage_estimate)))

    // Carbon calculation with sampled values
    const agb_project   = agb_sample * (ndvi_sample  / ndvi_healthy)
    const agb_baseline  = agb_sample * (baseline_sample / ndvi_healthy)
    const biomass_c_project  = (agb_project  * (1 + bgb_ratio_sample)) * cf_sample
    const biomass_c_baseline = (agb_baseline * (1 + bgb_ratio_sample)) * cf_sample
    const gross_co2e    = (biomass_c_project - biomass_c_baseline) * 3.6667 * area_ha
    const net_co2e      = gross_co2e * (1 - leakage_sample)

    results[i] = Math.max(0, net_co2e)
  }

  // Statistical analysis — O(n log n) for sort, O(n) for statistics
  const sorted = results.slice().sort()
  const mean   = results.reduce((s, v) => s + v, 0) / iterations
  const variance = results.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (iterations - 1)
  const std_dev  = Math.sqrt(variance)

  // Percentile function — O(1) with sorted array
  const pct = (p: number) => sorted[Math.floor(p * iterations / 100)]

  // Conservative estimate per IPCC guidance: use 2.5th percentile
  const conservative_estimate = pct(2.5)
  const uncertainty_pct = ((mean - conservative_estimate) / mean) * 100

  return {
    mean_co2e:              +mean.toFixed(2),
    std_dev:                +std_dev.toFixed(2),
    cv_pct:                 +((std_dev / mean) * 100).toFixed(1), // Coefficient of variation
    conservative_estimate:  +conservative_estimate.toFixed(2),    // 2.5th percentile (IPCC)
    uncertainty_pct:        +uncertainty_pct.toFixed(1),
    confidence_interval_95: { lower: +pct(2.5).toFixed(2), upper: +pct(97.5).toFixed(2) },
    confidence_interval_90: { lower: +pct(5.0).toFixed(2), upper: +pct(95.0).toFixed(2) },
    percentiles: { p5:+pct(5).toFixed(2), p25:+pct(25).toFixed(2), p50:+pct(50).toFixed(2), p75:+pct(75).toFixed(2), p95:+pct(95).toFixed(2) },
    iterations,
    method:   'IPCC_Method_2_Monte_Carlo',
    ipcc_ref: 'IPCC 2006 GL Vol 4 §3.2.3',
    algorithm:'Box-Muller Gaussian Transform + Float64Array typed buffer',
    time_complexity: `O(${iterations} × k) where k = carbon calculation steps`,
  }
}

/**
 * Leakage Quantification Engine
 * Based on BEE BM FR05.001 §7 + CDM Leakage Tool v2.0
 * 
 * Leakage types for mangrove A/R projects:
 * 1. Activity shifting — displaced agricultural/fishing activity
 * 2. Market leakage   — changes in regional timber/fuelwood supply
 * 3. Ecological       — changes in wildlife corridors
 */
function quantifyLeakage({
  project_area_ha,
  displaced_activity,           // 'agriculture' | 'aquaculture' | 'fishing' | 'fuelwood'
  displacement_fraction = 0.15, // Fraction of activity displaced outside project
  regional_supply_pct   = 0.05, // % of regional supply affected (market leakage)
  activity_emission_factor,     // tCO2e/ha/yr for displaced activity
}) {
  // Type 1: Activity shifting leakage
  const activity_leakage = project_area_ha * displacement_fraction * (activity_emission_factor || 2.5)

  // Type 2: Market leakage (CDM Tool v2 simplified)
  const market_leakage_fraction = displaced_activity === 'fuelwood'
    ? Math.min(regional_supply_pct * 2, 0.10) // Higher for fuelwood substitution
    : regional_supply_pct

  // Total leakage
  const total_leakage_factor = Math.min(
    displacement_fraction + market_leakage_fraction,
    0.30  // Cap at 30% per BEE BM FR05.001 §7.3
  )

  return {
    activity_leakage_factor:  +displacement_fraction.toFixed(3),
    market_leakage_factor:    +market_leakage_fraction.toFixed(3),
    total_leakage_factor:     +total_leakage_factor.toFixed(3),
    total_leakage_pct:        +(total_leakage_factor * 100).toFixed(1),
    activity_leakage_co2e:    +activity_leakage.toFixed(2),
    capped_at_30pct:          total_leakage_factor >= 0.30,
    methodology:              'BEE BM FR05.001 §7 + CDM Leakage Tool v2.0',
    displaced_activity,
    note: total_leakage_factor >= 0.25
      ? '⚠️ High leakage — project developer must demonstrate mitigation measures'
      : '✅ Leakage within acceptable range',
  }
}

/**
 * Additionality Assessment
 * CDM Additionality Tool v07.0.0 — Step 1-4
 * Required by BEE BM FR05.001 §5, ICVCM CCP Criterion 5
 */
function assessAdditionality({
  would_happen_without_project,  // boolean — regulatory surplus
  financially_viable_without,    // boolean — financial barrier
  common_practice_pct,           // % of similar land using this approach
  regulatory_requirement,        // boolean — legally required?
  investment_irr_without_carbon, // % IRR without carbon revenue
  min_acceptable_irr = 12,       // % minimum acceptable IRR for India
}) {
  const checks = [
    {
      step:    'Step 1: Regulatory Surplus',
      test:    !regulatory_requirement,
      result:  !regulatory_requirement ? 'PASS' : 'FAIL',
      detail:  regulatory_requirement
        ? 'Activity is legally required — NOT additional per UNFCCC/ICVCM'
        : 'Not legally required — passes regulatory surplus test',
      fatal:   regulatory_requirement,
    },
    {
      step:    'Step 2: Investment Analysis',
      test:    !financially_viable_without || investment_irr_without_carbon < min_acceptable_irr,
      result:  (!financially_viable_without || investment_irr_without_carbon < min_acceptable_irr) ? 'PASS' : 'CONDITIONAL',
      detail:  `Project IRR without carbon: ${investment_irr_without_carbon}% vs minimum ${min_acceptable_irr}%. ${investment_irr_without_carbon < min_acceptable_irr ? 'Financial barrier exists.' : 'Project may be financially viable without carbon — further analysis required.'}`,
      fatal:   false,
    },
    {
      step:    'Step 3: Barrier Analysis',
      test:    !would_happen_without_project,
      result:  !would_happen_without_project ? 'PASS' : 'FAIL',
      detail:  would_happen_without_project
        ? 'Activity would happen in the baseline — NOT additional'
        : 'Activity would NOT happen in baseline scenario — ADDITIONAL',
      fatal:   would_happen_without_project,
    },
    {
      step:    'Step 4: Common Practice',
      test:    common_practice_pct < 25,
      result:  common_practice_pct < 25 ? 'PASS' : 'FAIL',
      detail:  `${common_practice_pct}% of similar land uses this approach. ${common_practice_pct < 25 ? 'Not common practice.' : 'Widespread — difficult to prove additionality.'}`,
      fatal:   common_practice_pct >= 25,
    },
  ]

  const fatals  = checks.filter(c => c.fatal)
  const passing = checks.filter(c => c.result === 'PASS').length
  const score   = Math.round((passing / checks.length) * 100)

  return {
    additional:       fatals.length === 0 && passing >= 3,
    additionality_score: score,
    steps:            checks,
    fatal_failures:   fatals.map(f => f.step),
    recommendation:   fatals.length > 0
      ? 'Project FAILS additionality — cannot proceed to MRV'
      : passing >= 3
      ? 'Project PASSES additionality — proceed to methodology validation'
      : 'Conditional — additional documentation required',
    tool_version:     'CDM_Additionality_Tool_v07.0.0',
    standard_ref:     'UNFCCC CDM + BEE BM FR05.001 §5',
  }
}

module.exports = {
  propagateAdditionUncertainty,
  propagateMultiplicationUncertainty,
  monteCarloUncertainty,
  quantifyLeakage,
  assessAdditionality,
  DEFAULT_UNCERTAINTIES,
}

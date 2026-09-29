/**
 * CarbonX Methodology Engine
 * Registry of all supported carbon crediting methodologies
 * Architecture: Strategy Pattern — each methodology is a plugin
 * Extension: Add new methodology without changing core engine
 *
 * Supported: BEE BM FR05.001, Verra VM0033, Isometric Mangrove v1.0,
 *            Gold Standard LUF, ACR Blue Carbon
 */

// ── Methodology Registry ─────────────────────────────────────────
const METHODOLOGIES = {

  // ── BEE BM FR05.001 (India CCTS) ───────────────────────────────
  BEE_BM_FR05_001: {
    id:           'BEE_BM_FR05_001',
    name:         'BEE BM FR05.001',
    full_name:    'Afforestation and Reforestation of Degraded Mangrove Habitats',
    version:      '1.0',
    published:    '2025-03-27',
    body:         'Bureau of Energy Efficiency (BEE), India',
    standard:     'India CCTS (Carbon Credit Trading Scheme)',
    registry:     'ICM Registry (Grid Controller of India)',
    regulator:    'CERC (Central Electricity Regulatory Commission)',
    scope:        'Mangrove A/R — degraded coastal wetlands',
    geography:    'India only',
    ecosystem:    ['mangrove'],
    url:          'https://beeindia.gov.in',

    // Applicability conditions (§4)
    applicability: {
      requires_degraded_habitat:  true,
      min_mangrove_species_pct:   90,
      no_significant_soil_disturbance: true,
      requires_tidal_hydrology:   true,
      geographic_restriction:     'India',
    },

    // Carbon pools included (§6)
    carbon_pools: {
      above_ground_biomass: { included: true,  required: true  },
      below_ground_biomass: { included: true,  required: true  },
      dead_wood:            { included: false, required: false },
      litter:               { included: false, required: false },
      soil_organic_carbon:  { included: true,  required: false, note:'Include if significant' },
    },

    // Monitoring requirements (§8)
    monitoring: {
      frequency_years:          5,
      satellite_required:       true,
      field_plots_required:     true,
      ndvi_threshold:           0.80,
      soil_sampling_required:   false,
      biodiversity_monitoring:  false,
    },

    // Additionality tool
    additionality_tool:   'CDM Additionality Tool v07.0.0',
    crediting_period_yr:  30,
    renewable_period_yr:  20,
    buffer_pool_pct:      0.10,

    // Leakage (§7)
    leakage: {
      types:         ['activity_shifting', 'market_leakage'],
      max_pct:       0.30,
      default_pct:   0.10,
    },

    // Allometric equations
    allometric: {
      source:        'Komiyama et al. 2005 + IPCC 2013 Wetlands Supplement',
      ipcc_tier:     2,
      co2_factor:    3.6667,
      default_cf:    0.451,
    },
  },

  // ── Verra VM0033 ─────────────────────────────────────────────────
  VCS_VM0033: {
    id:        'VCS_VM0033',
    name:      'VM0033',
    full_name: 'Methodology for Tidal Wetland and Seagrass Restoration, v2.1',
    version:   '2.1',
    published: '2023-04-03',
    body:      'Verra (Verified Carbon Standard)',
    standard:  'VCS (Verified Carbon Standard)',
    registry:  'Verra Registry',
    regulator: 'Verra',
    scope:     'Tidal wetland, mangrove, seagrass restoration',
    geography: 'Global',
    ecosystem: ['mangrove','seagrass','saltmarsh'],
    url:       'https://verra.org/methodologies/vm0033',

    applicability: {
      requires_degraded_habitat:  true,
      min_mangrove_species_pct:   0, // No minimum for VM0033
      no_significant_soil_disturbance: false,
      requires_tidal_hydrology:   true,
      geographic_restriction:     'Global',
    },

    carbon_pools: {
      above_ground_biomass: { included: true, required: true  },
      below_ground_biomass: { included: true, required: true  },
      dead_wood:            { included: true, required: false },
      litter:               { included: false, required: false },
      soil_organic_carbon:  { included: true, required: true, note:'SOC is primary pool for seagrass/saltmarsh' },
    },

    monitoring: {
      frequency_years:         5,
      satellite_required:      true,
      field_plots_required:    true,
      ndvi_threshold:          0.60,
      soil_sampling_required:  true,
      biodiversity_monitoring: true,
    },

    additionality_tool:   'VT0001 Unplanned Deforestation + CDM Tool',
    crediting_period_yr:  30,
    renewable_period_yr:  30,

    buffer_pool_pct:      0.17, // Higher for VM0033 — non-permanence risk
    leakage: {
      types:         ['activity_shifting', 'ecological'],
      max_pct:       0.25,
      default_pct:   0.10,
    },

    allometric: {
      source:    'Kauffman & Donato 2012 + IPCC 2013 Wetlands Supplement',
      ipcc_tier: 2,
      co2_factor:3.6667,
      default_cf:0.451,
    },
  },

  // ── Isometric Mangrove Restoration v1.0 ──────────────────────────
  ISOMETRIC_MANGROVE_V1: {
    id:        'ISOMETRIC_MANGROVE_V1',
    name:      'Isometric Mangrove v1.0',
    full_name: 'Mangrove Restoration Protocol, Version 1.0',
    version:   '1.0',
    published: '2023-09-15',
    body:      'Isometric',
    standard:  'ICVCM CCP-Approved',
    registry:  'Isometric Registry',
    regulator: 'Isometric + ICVCM',
    scope:     'Mangrove restoration with CCP approval',
    geography: 'Global',
    ecosystem: ['mangrove'],
    url:       'https://registry.isometric.com/protocol/mangrove/1.0',

    applicability: {
      requires_degraded_habitat:  true,
      min_mangrove_species_pct:   50,
      no_significant_soil_disturbance: false,
      requires_tidal_hydrology:   true,
      geographic_restriction:     'Global',
    },

    carbon_pools: {
      above_ground_biomass: { included: true, required: true },
      below_ground_biomass: { included: true, required: true },
      dead_wood:            { included: false, required: false },
      litter:               { included: false, required: false },
      soil_organic_carbon:  { included: true, required: true },
    },

    monitoring: {
      frequency_years:         1,  // Annual monitoring — stricter
      satellite_required:      true,
      field_plots_required:    true,
      ndvi_threshold:          0.65,
      soil_sampling_required:  true,
      biodiversity_monitoring: true,
    },

    additionality_tool:   'Isometric Additionality Framework v1',
    crediting_period_yr:  30,
    renewable_period_yr:  30,

    // Isometric requires higher buffer — reversal monitoring strict
    buffer_pool_pct:      0.20,
    leakage: {
      types:         ['activity_shifting'],
      max_pct:       0.20,
      default_pct:   0.10,
    },

    allometric: {
      source:    'Twilley et al. 1992 + Saenger & Snedaker 1993 + IPCC 2013',
      ipcc_tier: 2,
      co2_factor:3.6667,
      default_cf:0.451,
    },
  },

  // ── Gold Standard LUF ─────────────────────────────────────────────
  GOLD_STANDARD_LUF: {
    id:        'GOLD_STANDARD_LUF',
    name:      'Gold Standard LUF',
    full_name: 'Gold Standard Land Use and Forests Activity Requirements v1.2',
    version:   '1.2',
    published: '2022-06-01',
    body:      'Gold Standard Foundation',
    standard:  'Gold Standard for the Global Goals (GS4GG)',
    registry:  'Gold Standard Impact Registry',
    regulator: 'Gold Standard Foundation',
    scope:     'Land use, forests, mangroves with SDG co-benefits',
    geography: 'Global — SDG focus',
    ecosystem: ['mangrove','forest','agroforestry'],
    url:       'https://www.goldstandard.org',

    applicability: {
      requires_degraded_habitat:  true,
      min_mangrove_species_pct:   0,
      no_significant_soil_disturbance: false,
      requires_tidal_hydrology:   false,
      geographic_restriction:     'Global',
    },

    carbon_pools: {
      above_ground_biomass: { included: true,  required: true  },
      below_ground_biomass: { included: true,  required: true  },
      dead_wood:            { included: false, required: false },
      litter:               { included: false, required: false },
      soil_organic_carbon:  { included: false, required: false },
    },

    monitoring: {
      frequency_years:         5,
      satellite_required:      false, // Not mandatory but recommended
      field_plots_required:    true,
      ndvi_threshold:          0.60,
      soil_sampling_required:  false,
      biodiversity_monitoring: true,
    },

    additionality_tool:   'Gold Standard Additionality Framework',
    crediting_period_yr:  20,
    renewable_period_yr:  20,

    buffer_pool_pct:      0.12,
    leakage: {
      types:         ['activity_shifting'],
      max_pct:       0.25,
      default_pct:   0.10,
    },

    allometric: {
      source:    'IPCC 2006 GL + Gold Standard approved equations',
      ipcc_tier: 2,
      co2_factor:3.6667,
      default_cf:0.451,
    },
  },
}

// ── Methodology Engine Functions ─────────────────────────────────

/**
 * Check which methodologies a project is eligible for
 * O(m × n) where m = methodologies, n = applicability conditions
 */
function checkMethodologyEligibility(projectData) {
  const {
    ecosystem, location_country = 'India',
    is_degraded, mangrove_species_pct = 0,
    area_ha, ndvi_score, has_tidal_hydrology,
  } = projectData

  return Object.values(METHODOLOGIES).map(method => {
    const checks = []
    let eligible = true

    // Ecosystem check
    const ecosystemMatch = method.ecosystem.includes(ecosystem)
    checks.push({ rule:'Ecosystem type', pass: ecosystemMatch, detail: `${ecosystem} ${ecosystemMatch?'✓ supported':'✗ not supported'} by ${method.name}` })
    if (!ecosystemMatch) eligible = false

    // Geography check
    if (method.applicability.geographic_restriction === 'India') {
      const geoPass = location_country === 'India'
      checks.push({ rule:'Geography', pass: geoPass, detail: `${method.name} requires India project location` })
      if (!geoPass) eligible = false
    } else {
      checks.push({ rule:'Geography', pass: true, detail: 'Global methodology' })
    }

    // Degraded habitat
    if (method.applicability.requires_degraded_habitat) {
      const degPass = is_degraded === true || is_degraded === 'yes'
      checks.push({ rule:'Degraded habitat', pass: degPass, detail: `${method.name} requires degraded habitat baseline` })
      if (!degPass) eligible = false
    }

    // Species composition
    if (method.applicability.min_mangrove_species_pct > 0) {
      const spcPass = mangrove_species_pct >= method.applicability.min_mangrove_species_pct
      checks.push({ rule:`≥${method.applicability.min_mangrove_species_pct}% mangrove species`, pass: spcPass, detail: `Current: ${mangrove_species_pct}%` })
      if (!spcPass) eligible = false
    }

    // Hydrology
    if (method.applicability.requires_tidal_hydrology) {
      const hydPass = has_tidal_hydrology !== false
      checks.push({ rule:'Tidal hydrology', pass: hydPass, detail: 'Tidal connectivity required for blue carbon sequestration' })
    }

    // Area
    if (area_ha && area_ha < 0.1) {
      checks.push({ rule:'Minimum area', pass: false, detail: `${area_ha} ha < 0.1 ha minimum` })
      eligible = false
    }

    const passCount = checks.filter(c => c.pass).length
    const score = Math.round((passCount / checks.length) * 100)

    return {
      methodology:          method,
      eligible,
      eligibility_score:    score,
      checks,
      recommended:          eligible && score === 100,
      buffer_pool_required: method.buffer_pool_pct,
      crediting_period_yr:  method.crediting_period_yr,
    }
  })
}

/**
 * Get recommended methodology for a project
 * Priority: India projects → BEE BM FR05.001 first (CCTS compliance)
 */
function recommendMethodology(projectData) {
  const results = checkMethodologyEligibility(projectData)
  const eligible = results.filter(r => r.eligible).sort((a, b) => {
    // India-specific: prefer BEE first for CCTS revenue
    if (projectData.location_country === 'India') {
      if (a.methodology.id === 'BEE_BM_FR05_001') return -1
      if (b.methodology.id === 'BEE_BM_FR05_001') return  1
    }
    // Then by ICVCM approval (Isometric is CCP-approved)
    if (a.methodology.standard?.includes('CCP')) return -1
    if (b.methodology.standard?.includes('CCP')) return  1
    return b.eligibility_score - a.eligibility_score
  })

  return {
    primary:       eligible[0]      || null,
    alternatives:  eligible.slice(1) || [],
    all_results:   results,
    note:          eligible.length === 0
      ? 'No methodology eligible — check project parameters'
      : `${eligible.length} eligible methodology${eligible.length > 1 ? 'ies' : ''}. Primary recommendation: ${eligible[0]?.methodology.name}`,
  }
}

/**
 * Get methodology by ID — O(1) hash lookup
 */
function getMethodology(id) {
  return METHODOLOGIES[id] || null
}

/**
 * List all methodologies — O(m)
 */
function listMethodologies() {
  return Object.values(METHODOLOGIES)
}

module.exports = {
  METHODOLOGIES,
  checkMethodologyEligibility,
  recommendMethodology,
  getMethodology,
  listMethodologies,
}

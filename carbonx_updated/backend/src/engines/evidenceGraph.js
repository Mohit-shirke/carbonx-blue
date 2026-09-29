/**
 * CarbonX Evidence Graph Engine
 * Creates complete audit trail from raw data → credit issuance
 * Every number is traceable to its source — this is the CarbonX moat
 * Inspired by: W3C PROV-DM, Verra Registry Evidence Requirements
 */

const { v4: uuidv4 } = require('uuid')
const crypto          = require('crypto')

// ── Evidence Node Types ───────────────────────────────────────────
const NODE_TYPES = {
  RAW_SATELLITE:    'raw_satellite_image',
  PROCESSED_NDVI:   'processed_ndvi',
  FIELD_PLOT:       'field_plot_measurement',
  ALLOMETRIC_EQ:    'allometric_equation',
  CARBON_CALC:      'carbon_calculation',
  UNCERTAINTY_MODEL:'uncertainty_model',
  LEAKAGE_CALC:     'leakage_calculation',
  BASELINE_MODEL:   'baseline_model',
  VERIFICATION:     'verification_report',
  REGISTRY_ISSUANCE:'registry_issuance',
  CREDIT_SERIAL:    'credit_serial',
  TRANSFER:         'credit_transfer',
  RETIREMENT:       'credit_retirement',
}

/**
 * Create a tamper-evident evidence node
 * Each node stores a SHA-256 hash of its content
 */
function createEvidenceNode({ type, data, parent_ids = [], metadata = {} }) {
  const id        = uuidv4()
  const content   = JSON.stringify({ type, data, parent_ids, metadata, created_at: new Date().toISOString() })
  const hash      = crypto.createHash('sha256').update(content).digest('hex')

  return {
    id,
    type,
    hash,
    data,
    parent_ids,
    metadata: {
      ...metadata,
      node_version: '1.0',
      engine:       'CarbonX-Evidence-Graph-v1',
    },
    created_at: new Date().toISOString(),
    // Verification URL (in production: IPFS hash)
    ipfs_hint:  `sha256:${hash}`,
  }
}

/**
 * Build complete evidence graph for a carbon calculation
 * Connects: Satellite → NDVI → Field Data → Calculation → Credit
 */
function buildCalculationEvidenceGraph({
  project,
  satellite_data,
  field_measurements,
  carbon_result,
  methodology_version,
}) {
  const nodes = []
  const edges = []

  // ── Layer 1: Raw satellite data ───────────────────────────────
  const satNode = createEvidenceNode({
    type: NODE_TYPES.RAW_SATELLITE,
    data: {
      source:      satellite_data.source || 'Copernicus Sentinel-2',
      scene_id:    satellite_data.scene_id,
      acquisition: satellite_data.date,
      bands:       satellite_data.bands || ['B4', 'B8'],
      resolution:  satellite_data.resolution || '10m',
      cloud_cover: satellite_data.cloud_cover_pct,
    },
    metadata: { project_id: project.id, project_name: project.name },
  })
  nodes.push(satNode)

  // ── Layer 2: Processed NDVI ───────────────────────────────────
  const ndviNode = createEvidenceNode({
    type: NODE_TYPES.PROCESSED_NDVI,
    data: {
      ndvi_mean:   carbon_result.inputs.ndvi_score,
      ndvi_min:    satellite_data.ndvi_min,
      ndvi_max:    satellite_data.ndvi_max,
      ndvi_std:    satellite_data.ndvi_std,
      formula:     'NDVI = (B8 - B4) / (B8 + B4)',
      algorithm:   'Sen2Cor + cloud mask',
      area_ha:     carbon_result.inputs.area_ha,
    },
    parent_ids: [satNode.id],
    metadata:   { methodology: methodology_version },
  })
  nodes.push(ndviNode)
  edges.push({ from: satNode.id, to: ndviNode.id, relation: 'derived_from' })

  // ── Layer 3: Field measurements ───────────────────────────────
  const fieldNodes = (field_measurements || []).map(plot => {
    const n = createEvidenceNode({
      type: NODE_TYPES.FIELD_PLOT,
      data: {
        plot_id:     plot.id,
        latitude:    plot.lat,
        longitude:   plot.lng,
        species:     plot.species,
        dbh_cm:      plot.dbh_cm,
        height_m:    plot.height_m,
        agb_t:       plot.agb_t,
        measured_by: plot.surveyor,
        date:        plot.date,
      },
      metadata: { project_id: project.id },
    })
    nodes.push(n)
    return n
  })

  // ── Layer 4: Allometric equations ─────────────────────────────
  const alloNode = createEvidenceNode({
    type: NODE_TYPES.ALLOMETRIC_EQ,
    data: {
      equation:   'AGB = a × DBH^b (Komiyama et al. 2005)',
      reference:  'Komiyama A. et al. Forest Ecology and Management 230 (2006)',
      parameters: { a: 0.1940, b: 2.333 },
      species:    'Rhizophora apiculata (general mangrove)',
      ipcc_tier:  2,
    },
  })
  nodes.push(alloNode)
  fieldNodes.forEach(fn => edges.push({ from: fn.id, to: alloNode.id, relation: 'calibrated_by' }))

  // ── Layer 5: Baseline model ───────────────────────────────────
  const baselineNode = createEvidenceNode({
    type: NODE_TYPES.BASELINE_MODEL,
    data: {
      baseline_scenario:       'Business-as-usual degradation',
      baseline_ndvi:            carbon_result.inputs.baseline_ndvi,
      degradation_rate_yr:      0.015,
      baseline_co2e_ha_yr:      carbon_result.calculation.baseline_co2e_ha_yr,
      methodology_section:      'BEE BM FR05.001 §6.2',
      additionality_tool:       'CDM Additionality Tool v07.0.0',
    },
    parent_ids: [ndviNode.id],
  })
  nodes.push(baselineNode)
  edges.push({ from: ndviNode.id, to: baselineNode.id, relation: 'input_to' })

  // ── Layer 6: Leakage calculation ──────────────────────────────
  const leakageNode = createEvidenceNode({
    type: NODE_TYPES.LEAKAGE_CALC,
    data: {
      leakage_type:     'Activity shifting (displaced fishing/aquaculture)',
      leakage_fraction: carbon_result.inputs.leakage_fraction,
      leakage_tonnes:   carbon_result.calculation.leakage_deduction,
      methodology:      'BEE BM FR05.001 §7 — Leakage',
    },
  })
  nodes.push(leakageNode)

  // ── Layer 7: Uncertainty model ────────────────────────────────
  const uncertaintyNode = createEvidenceNode({
    type: NODE_TYPES.UNCERTAINTY_MODEL,
    data: {
      uncertainty_pct:       carbon_result.inputs.uncertainty_pct * 100,
      uncertainty_deduction: carbon_result.calculation.uncertainty_deduction,
      confidence_score:      carbon_result.confidence.score,
      confidence_rating:     carbon_result.confidence.rating,
      ipcc_approach:         'IPCC 2006 GL Vol 4 §2.3.2 — Error propagation',
      sources: ['Measurement uncertainty', 'Model uncertainty', 'Spatial uncertainty', 'Temporal uncertainty'],
    },
    parent_ids: [ndviNode.id, alloNode.id],
  })
  nodes.push(uncertaintyNode)
  edges.push({ from: alloNode.id,    to: uncertaintyNode.id, relation: 'input_to' })
  edges.push({ from: baselineNode.id,to: uncertaintyNode.id, relation: 'input_to' })

  // ── Layer 8: Carbon calculation ───────────────────────────────
  const calcNode = createEvidenceNode({
    type: NODE_TYPES.CARBON_CALC,
    data: {
      methodology:             'BEE BM FR05.001 + IPCC Tier 2',
      gross_co2e:              carbon_result.result.gross_co2e_tonnes,
      net_co2e:                carbon_result.result.net_co2e_tonnes,
      creditable_co2e:         carbon_result.result.creditable_co2e_tonnes,
      annual_credits:          carbon_result.result.annual_credits,
      formula:                 'Net = Project − Baseline − Leakage − Uncertainty',
      version:                 methodology_version || 'v1.0',
    },
    parent_ids: [ndviNode.id, baselineNode.id, leakageNode.id, uncertaintyNode.id],
  })
  nodes.push(calcNode)
  edges.push({ from: baselineNode.id,  to: calcNode.id, relation: 'input_to' })
  edges.push({ from: leakageNode.id,   to: calcNode.id, relation: 'input_to' })
  edges.push({ from: uncertaintyNode.id,to: calcNode.id,relation: 'input_to' })

  // ── Build merkle-style root hash ──────────────────────────────
  const allHashes = nodes.map(n => n.hash).sort().join('')
  const root_hash = crypto.createHash('sha256').update(allHashes).digest('hex')

  return {
    graph_id:       uuidv4(),
    project_id:     project.id,
    root_hash,
    nodes,
    edges,
    summary: {
      total_nodes:      nodes.length,
      total_edges:      edges.length,
      creditable_tonnes: carbon_result.result.creditable_co2e_tonnes,
      methodology:      'BEE BM FR05.001',
      tamper_evident:   true,
    },
    created_at: new Date().toISOString(),
  }
}

/**
 * Verify evidence graph integrity
 * Recomputes all hashes and checks root hash
 */
function verifyEvidenceGraph(graph) {
  const recomputed = graph.nodes.map(n => {
    const content = JSON.stringify({ type: n.type, data: n.data, parent_ids: n.parent_ids, metadata: n.metadata, created_at: n.created_at })
    return crypto.createHash('sha256').update(content).digest('hex')
  }).sort().join('')

  const computed_root = crypto.createHash('sha256').update(recomputed).digest('hex')

  return {
    valid:          computed_root === graph.root_hash,
    stored_hash:    graph.root_hash,
    computed_hash:  computed_root,
    tamper_detected: computed_root !== graph.root_hash,
    nodes_verified: graph.nodes.length,
  }
}

module.exports = { createEvidenceNode, buildCalculationEvidenceGraph, verifyEvidenceGraph, NODE_TYPES }

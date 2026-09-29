/**
 * CarbonX Double-Counting Prevention Engine
 * Implements ICVCM Core Carbon Principles anti-double-counting requirements
 * Prevents: double issuance, double claiming, double use
 * Reference: ICVCM CCP Assessment Framework v2.0 (2023)
 */

const { v4: uuidv4 } = require('uuid')
const crypto          = require('crypto')

// ── Serial Number Generation ──────────────────────────────────────
/**
 * Generate unique, tamper-evident serial numbers for each credit
 * Format: CX-{REGISTRY}-{PROJECT}-{VINTAGE}-{SEQUENCE}-{CHECKSUM}
 * Example: CX-VERRA-SDB001-2025-0000001-A3F9
 */
function generateCreditSerial({ registry, projectCode, vintage, sequence }) {
  const base     = `CX-${registry}-${projectCode}-${vintage}-${String(sequence).padStart(7,'0')}`
  const checksum = crypto.createHash('sha256').update(base).digest('hex').slice(0,4).toUpperCase()
  return `${base}-${checksum}`
}

/**
 * Generate a full batch of serial numbers for a credit issuance
 */
function generateSerialBatch({ registry, projectCode, vintage, startSeq, quantity }) {
  return Array.from({ length: quantity }, (_, i) => ({
    serial:   generateCreditSerial({ registry, projectCode, vintage, sequence: startSeq + i }),
    batch_id: uuidv4(),
    status:   'issued',
    issued_at: new Date().toISOString(),
  }))
}

// ── Double-Counting Checks ────────────────────────────────────────
/**
 * Check 1: Double Issuance Prevention
 * Ensures the same underlying removal activity is not credited twice
 */
async function checkDoubleIssuance(db, { project_id, vintage_year, monitoring_period_id }) {
  const existing = await db('credit_serials')
    .where({ project_id, vintage_year, monitoring_period_id })
    .whereNot({ status: 'cancelled' })
    .count('id as count')
    .first()

  if (parseInt(existing.count) > 0) {
    return {
      passed: false,
      risk:   'DOUBLE_ISSUANCE',
      detail: `Credits already issued for project ${project_id} vintage ${vintage_year} monitoring period ${monitoring_period_id}. Issuance blocked.`,
      severity: 'CRITICAL',
    }
  }
  return { passed: true, check: 'double_issuance' }
}

/**
 * Check 2: Double Claiming Prevention
 * Ensures retired credits are not claimed again
 */
async function checkDoubleClaiming(db, { serial_numbers }) {
  const retired = await db('credit_serials')
    .whereIn('serial', serial_numbers)
    .where({ status: 'retired' })
    .select('serial')

  if (retired.length > 0) {
    return {
      passed:   false,
      risk:     'DOUBLE_CLAIMING',
      detail:   `${retired.length} serial(s) already retired: ${retired.map(r => r.serial).join(', ')}`,
      severity: 'CRITICAL',
      blocked_serials: retired.map(r => r.serial),
    }
  }
  return { passed: true, check: 'double_claiming' }
}

/**
 * Check 3: Ownership Verification
 * Ensures seller actually owns the credits being transferred
 */
async function checkOwnership(db, { serial_numbers, seller_id }) {
  const notOwned = await db('credit_holdings')
    .whereIn('serial', serial_numbers)
    .whereNot({ holder_id: seller_id })
    .whereNot({ status: 'available' })
    .select('serial', 'holder_id')

  if (notOwned.length > 0) {
    return {
      passed:   false,
      risk:     'OWNERSHIP_MISMATCH',
      detail:   `${notOwned.length} credit(s) not owned by seller ${seller_id}`,
      severity: 'CRITICAL',
    }
  }
  return { passed: true, check: 'ownership' }
}

/**
 * Check 4: Registry Reconciliation
 * Cross-reference with official registry status
 * In production: connects to ICM Registry API / Verra API
 */
async function checkRegistryStatus(db, { serial_numbers, external_registry }) {
  // For now: check internal registry_status field
  // Production: call external registry API
  const invalidStatuses = await db('credit_serials')
    .whereIn('serial', serial_numbers)
    .whereIn('registry_status', ['cancelled', 'suspended', 'reversed', 'under_review'])
    .select('serial', 'registry_status')

  if (invalidStatuses.length > 0) {
    return {
      passed:   false,
      risk:     'INVALID_REGISTRY_STATUS',
      detail:   `${invalidStatuses.length} serial(s) have invalid registry status`,
      severity: 'HIGH',
      details:  invalidStatuses,
    }
  }
  return { passed: true, check: 'registry_status' }
}

/**
 * Run ALL double-counting checks before any transfer or retirement
 * Returns comprehensive result — ALL checks must pass
 */
async function runDoubleCountingChecks(db, params) {
  const results  = []
  const { type } = params // 'issuance' | 'transfer' | 'retirement'

  if (type === 'issuance') {
    results.push(await checkDoubleIssuance(db, params))
  }
  if (['transfer', 'retirement'].includes(type)) {
    results.push(await checkDoubleClaiming(db, params))
    results.push(await checkOwnership(db, params))
    results.push(await checkRegistryStatus(db, params))
  }

  const failed  = results.filter(r => !r.passed)
  const blocked = failed.some(r => r.severity === 'CRITICAL')

  // Log all checks to audit trail
  await db('audit_logs').insert({
    id:            uuidv4(),
    action:        `double_counting_check_${type}`,
    resource_type: 'credit_serial',
    meta:          JSON.stringify({ results, blocked }),
    created_at:    new Date(),
  }).catch(() => {})

  return {
    cleared:      failed.length === 0,
    blocked,
    checks_run:   results.length,
    checks_passed: results.filter(r => r.passed).length,
    failures:     failed,
    timestamp:    new Date().toISOString(),
  }
}

// ── Credit Lifecycle State Machine ────────────────────────────────
const VALID_TRANSITIONS = {
  issued:       ['available', 'cancelled'],
  available:    ['reserved', 'transferred', 'cancelled'],
  reserved:     ['available', 'transferred', 'cancelled'],
  transferred:  ['available', 'retired', 'cancelled'],
  retired:      [],         // Terminal state — no transitions allowed
  cancelled:    [],         // Terminal state — no transitions allowed
  reversed:     ['under_review'],
  under_review: ['available', 'cancelled'],
}

function validateStateTransition(currentStatus, newStatus) {
  const allowed = VALID_TRANSITIONS[currentStatus] || []
  if (!allowed.includes(newStatus)) {
    return {
      valid:  false,
      error:  `Invalid transition: ${currentStatus} → ${newStatus}. Allowed: ${allowed.join(', ') || 'none (terminal state)'}`,
    }
  }
  return { valid: true }
}

module.exports = {
  generateCreditSerial,
  generateSerialBatch,
  checkDoubleIssuance,
  checkDoubleClaiming,
  checkOwnership,
  checkRegistryStatus,
  runDoubleCountingChecks,
  validateStateTransition,
}

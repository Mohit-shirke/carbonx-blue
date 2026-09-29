/**
 * CarbonX Database Client
 * Knex + PostgreSQL with graceful connection handling and circuit breaker
 */
require('dotenv').config()

const knex = require('knex')({
  client: 'postgresql',
  connection: {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME     || 'carbonx_db',
    user:     process.env.DB_USER     || 'carbonx',
    password: process.env.DB_PASSWORD || 'password',
    ssl:      process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // Fail fast on connect attempt
    connectionTimeoutMillis: 1500,
    query_timeout: 3000,
  },
  pool: {
    min: 0,
    max: 5,
    acquireTimeoutMillis: 1500,
    createTimeoutMillis:  1500,
    idleTimeoutMillis:    10000,
    createRetryIntervalMillis: 100,
    // Don't keep broken connections
    reapIntervalMillis: 1000,
  },
  acquireConnectionTimeout: 1500,
})

// ─── Circuit Breaker ──────────────────────────────────────────────
// Tracks DB availability so we skip pool waits after first failure
let dbOnline = null        // null = unknown → treat as offline for fast responses
let lastDbCheck = 0
let dbCheckInFlight = false
const DB_CHECK_INTERVAL = 30_000  // re-check every 30s

knex.dbIsOnline = async function () {
  const now = Date.now()

  // Within cache window → return cached result (or false if unknown)
  if (dbOnline !== null && now - lastDbCheck < DB_CHECK_INTERVAL) {
    return dbOnline
  }

  // If unknown or cache expired, return false immediately (serve fallback)
  // but trigger a background check so next requests can use live DB
  if (!dbCheckInFlight) {
    dbCheckInFlight = true
    knex.raw('SELECT 1')
      .then(() => {
        dbOnline = true
        lastDbCheck = Date.now()
        dbCheckInFlight = false
      })
      .catch(() => {
        dbOnline = false
        lastDbCheck = Date.now()
        dbCheckInFlight = false
      })
  }

  // While check is in flight (or dbOnline is null), serve fallback
  return dbOnline === true
}

// Test connection on startup (non-blocking)
knex.raw('SELECT 1')
  .then(() => {
    dbOnline = true
    lastDbCheck = Date.now()
    console.log('✅ PostgreSQL connected successfully')
  })
  .catch(() => {
    dbOnline = false
    lastDbCheck = Date.now()
    console.warn('⚠️  PostgreSQL not connected (using resilient in-memory fallback)')
  })

module.exports = knex

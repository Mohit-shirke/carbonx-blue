/**
 * CarbonX Database Client
 * Knex + PostgreSQL with graceful connection handling
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
  },
  pool: {
    min: 0,
    max: 10,
    acquireTimeoutMillis: 10000,
    createTimeoutMillis:  10000,
    idleTimeoutMillis:    30000,
    createRetryIntervalMillis: 200,
  },
  acquireConnectionTimeout: 10000,
})

// Test connection on startup (non-blocking)
knex.raw('SELECT 1')
  .then(() => console.log('✅ PostgreSQL connected successfully'))
  .catch(err => {
    console.warn('⚠️  PostgreSQL not connected: (app will still start)')
    console.warn('   Run: docker start carbonx_postgres')
  })

module.exports = knex

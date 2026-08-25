/**
 * Database client – Knex.js with PostgreSQL
 */

const knex = require('knex')
const path = require('path')

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL || {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME     || 'carbonx_db',
    user:     process.env.DB_USER     || 'carbonx',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    // Resolved relative to project root (where npm run migrate is called from)
    directory: path.resolve(__dirname, '../../db/migrations'),
  },
  seeds: {
    directory: path.resolve(__dirname, '../../db/seeds'),
  },
})

// Test connection on startup (non-fatal)
db.raw('SELECT 1')
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => console.warn('⚠️  PostgreSQL not connected:', err.message, '(app will still start)'))

module.exports = db

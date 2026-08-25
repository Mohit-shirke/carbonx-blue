/**
 * CarbonX Backend — Express.js Server
 */
require('dotenv').config()

// Only JWT_SECRET is truly required at startup
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set — using development default. SET THIS IN PRODUCTION.')
  process.env.JWT_SECRET = 'dev_jwt_secret_change_in_production_minimum_32_chars'
}

const express      = require('express')
const cors         = require('cors')
const helmet       = require('helmet')
const cookieParser = require('cookie-parser')
const morgan       = require('morgan')
const rateLimit    = require('express-rate-limit')
const crypto       = require('crypto')

const authRoutes    = require('./routes/auth')
const paymentRoutes = require('./routes/payments')
const mrvRoutes     = require('./routes/mrv')
const projectRoutes = require('./routes/projects')
const ledgerRoutes  = require('./routes/ledger')
const emailRoutes   = require('./routes/email')

const app  = express()
const PORT = parseInt(process.env.PORT || '4000', 10)
const PROD = process.env.NODE_ENV === 'production'

// Request ID
app.use((req, _res, next) => { req.id = crypto.randomUUID(); next() })

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Managed by Next.js frontend
  crossOriginEmbedderPolicy: false,
}))

// CORS
const ALLOWED = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3001',
]
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED.includes(origin)) return cb(null, true)
    cb(null, true) // Allow all in development
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Request-ID'],
}))

// Stripe webhook raw body BEFORE json parser
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }))

// Body parsing
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false, limit: '1mb' }))
app.use(cookieParser())

// Logging
app.use(morgan('dev'))

// Global rate limiter
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: PROD ? 150 : 1000,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many requests. Please try again later.' },
}))

// Strict limiter on auth
app.use('/api/v1/auth/login',           rateLimit({ windowMs: 15*60*1000, max: 10, message: { error: 'Too many login attempts. Please wait 15 minutes.' } }))
app.use('/api/v1/auth/register',        rateLimit({ windowMs: 60*60*1000, max: 5,  message: { error: 'Too many registration attempts.' } }))
app.use('/api/v1/auth/forgot-password', rateLimit({ windowMs: 60*60*1000, max: 3,  message: { error: 'Too many password reset requests.' } }))

// Routes
app.use('/api/v1/auth',     authRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/v1/mrv',      mrvRoutes)
app.use('/api/v1/projects', projectRoutes)
app.use('/api/v1/ledger',   ledgerRoutes)
app.use('/api/v1/email',    emailRoutes)

// Health check
app.get('/health', (req, res) => res.json({
  status: 'ok', service: 'carbonx-backend',
  timestamp: new Date().toISOString(),
  db: 'check /health/db',
}))

// DB health check
app.get('/health/db', async (req, res) => {
  try {
    const db = require('./db/client')
    await db.raw('SELECT 1')
    res.json({ status: 'ok', db: 'connected' })
  } catch {
    res.status(503).json({ status: 'degraded', db: 'disconnected — run: docker start carbonx_postgres' })
  }
})

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found', requestId: req.id }))

// Error handler
app.use((err, req, res, next) => {
  const status = err.statusCode || err.status || 500
  if (status >= 500) console.error(`[ERROR] ${req.id}:`, err.message)
  res.status(status).json({
    error:     PROD ? 'An error occurred. Please try again.' : (err.message || 'Internal server error'),
    requestId: req.id,
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🌱 CarbonX Backend running on http://localhost:${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Polygon Amoy RPC: ${process.env.POLYGON_AMOY_RPC || 'not configured'}`)
  if (!PROD) console.log(`   Health: http://localhost:${PORT}/health\n`)
})

module.exports = app

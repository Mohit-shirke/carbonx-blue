/**
 * CarbonX Backend – Express.js server
 * Modular router architecture with JWT auth, Stripe webhooks, and Web3 relayer
 */

require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const authRoutes    = require('./routes/auth')
const paymentRoutes = require('./routes/payments')
const mrvRoutes     = require('./routes/mrv')
const projectRoutes = require('./routes/projects')
const ledgerRoutes  = require('./routes/ledger')

const app = express()
const PORT = process.env.PORT || 4000

// ─── Security middleware ──────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ─── Stripe webhook needs raw body – mount BEFORE express.json() ─
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }))

// ─── Standard body parsing ────────────────────────────────────────
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ─── Logging ─────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// ─── Global rate limiter ─────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
})
app.use('/api/', globalLimiter)

// ─── Stricter auth rate limiter ───────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts.' },
})
app.use('/api/v1/auth/', authLimiter)

// ─── Routes ───────────────────────────────────────────────────────
app.use('/api/v1/auth',     authRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/v1/mrv',      mrvRoutes)
app.use('/api/v1/projects', projectRoutes)
app.use('/api/v1/ledger',   ledgerRoutes)

// ─── Health check ─────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'carbonx-backend',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  })
})

// ─── 404 handler ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
})

// ─── Global error handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message, err.stack)
  const status = err.statusCode || err.status || 500
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
})

// ─── Start ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌱 CarbonX Backend running on http://localhost:${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV}`)
  console.log(`   Polygon Mainnet RPC: ${process.env.POLYGON_RPC}\n`)
})

module.exports = app

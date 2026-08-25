/**
 * CarbonX Backend — Express.js Server
 * Security: Helmet, CORS, rate limiting, XSS protection,
 *           request ID, structured error handling, no info leakage
 */

require('dotenv').config()

// ── Critical env check — fail fast ────────────────────────────────
const REQUIRED_ENV = ['JWT_SECRET','DB_HOST','DB_NAME','DB_USER','DB_PASSWORD']
const missing = REQUIRED_ENV.filter(k => !process.env[k])
if (missing.length) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`)
  console.error('   Copy backend/.env.example to backend/.env and fill all values.')
  process.exit(1)
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

// ── Request ID middleware ─────────────────────────────────────────
app.use((req, _res, next) => {
  req.id = crypto.randomUUID()
  next()
})

// ── Security headers via Helmet ───────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'"],
      styleSrc:       ["'self'", "'unsafe-inline'"],
      imgSrc:         ["'self'", 'data:', 'https:'],
      connectSrc:     ["'self'"],
      frameSrc:       ["'none'"],
      objectSrc:      ["'none'"],
      upgradeInsecureRequests: PROD ? [] : null,
    },
  },
  crossOriginEmbedderPolicy:   false,
  crossOriginResourcePolicy:   { policy: 'cross-origin' },
  hsts: PROD ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
}))

// ── CORS — locked to frontend origin ─────────────────────────────
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
    cb(new Error(`CORS policy: origin ${origin} not allowed`))
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Request-ID'],
}))

// ── Stripe webhook — raw body BEFORE json parser ──────────────────
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }))

// ── Body parsing ──────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false, limit: '1mb' }))
app.use(cookieParser())

// ── Logging — no sensitive fields ────────────────────────────────
if (!PROD) {
  app.use(morgan('dev'))
} else {
  // Production: structured JSON logs, scrub auth headers
  morgan.token('request-id', req => req.id)
  app.use(morgan('{"time":":date[iso]","method":":method","url":":url","status":":status","ms":":response-time","id":":request-id"}', {
    skip: (req) => req.url === '/health',
  }))
}

// ── Global rate limiter ───────────────────────────────────────────
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: PROD ? 150 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  message: { error:'Too many requests. Please try again later.', retryAfter: '15 minutes' },
}))

// ── Auth endpoints — strict limiter ──────────────────────────────
app.use('/api/v1/auth/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error:'Too many authentication attempts. Please wait 15 minutes.' },
}))

// ── Password reset — very strict ─────────────────────────────────
app.use('/api/v1/auth/forgot-password', rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error:'Too many password reset requests. Please wait 1 hour.' },
}))

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/v1/auth',     authRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/v1/mrv',      mrvRoutes)
app.use('/api/v1/projects', projectRoutes)
app.use('/api/v1/ledger',   ledgerRoutes)
app.use('/api/v1/email',    emailRoutes)

// ── Health check — minimal info ───────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status:'ok', service:'carbonx-backend', timestamp: new Date().toISOString() })
})

// ── 404 ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error:'Route not found', requestId: req.id })
})

// ── Global error handler — no stack traces in production ──────────
app.use((err, req, res, next) => {
  const status = err.statusCode || err.status || 500

  // Never log passwords or tokens
  const safeMessage = err.message?.replace(/password[^\s]*/gi, '[REDACTED]')

  if (status >= 500) {
    console.error(`[ERROR] ${req.id} ${safeMessage}`)
  }

  res.status(status).json({
    error:     PROD ? 'An error occurred. Please try again.' : safeMessage,
    requestId: req.id,
    ...(PROD ? {} : { stack: err.stack }),
  })
})

// ── Start ─────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🌱 CarbonX Backend running on http://localhost:${PORT}`)
  console.log(`   Environment:  ${process.env.NODE_ENV || 'development'}`)
  console.log(`   CORS origin:  ${ALLOWED_ORIGINS.join(', ')}`)
  if (!PROD) console.log(`   Health:       http://localhost:${PORT}/health\n`)
})

module.exports = app

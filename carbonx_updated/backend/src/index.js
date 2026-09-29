/**
 * CarbonX Backend — Express.js Server
 * Polygon PoS Mainnet | PostgreSQL | JWT Auth | Stripe
 */

require('dotenv').config()
const express       = require('express')
const cors          = require('cors')
const helmet        = require('helmet')
const cookieParser  = require('cookie-parser')
const morgan        = require('morgan')
const rateLimit     = require('express-rate-limit')

const app  = express()
const PORT = process.env.PORT || 4000

// ── Security middleware ───────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy:     false,
}))

// ── CORS ─────────────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods:     ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders:['Content-Type','Authorization'],
}))

// ── Body parsing ──────────────────────────────────────────────────
app.use(express.json({ limit:'10mb' }))
app.use(express.urlencoded({ extended:true, limit:'10mb' }))
app.use(cookieParser())

// ── Logging (development only) ────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// ── Prefix normalization ──────────────────────────────────────────
app.use((req, res, next) => {
  if (req.url.startsWith('/api/v1/api/v1')) {
    req.url = req.url.replace('/api/v1/api/v1', '/api/v1')
  }
  next()
})

// ── Rate limiting ─────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max:      150,
  message:  { error:'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
})
app.use('/api/', limiter)

// ── Health checks ─────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({
  status:   'ok',
  service:  'CarbonX API',
  version:  '1.0.0',
  network:  'Polygon Mainnet (Chain ID: 137)',
  time:     new Date().toISOString(),
}))

app.get('/health/db', async (req, res) => {
  try {
    const db = require('./db/client')
    await db.raw('SELECT 1')
    res.json({ status:'ok', database:'PostgreSQL', connected:true })
  } catch (err) {
    res.status(503).json({ status:'error', database:'PostgreSQL', connected:false, hint:'Run: docker start carbonx_postgres' })
  }
})

// ── Routes ────────────────────────────────────────────────────────
try { app.use('/api/v1/auth',     require('./routes/auth'))     } catch(e) { console.warn('auth route:', e.message) }
try { app.use('/api/v1/projects', require('./routes/projects'))  } catch(e) { console.warn('projects route:', e.message) }
try { app.use('/api/v1/mrv',      require('./routes/mrv'))       } catch(e) { console.warn('mrv route:', e.message) }
try { app.use('/api/v1/ledger',   require('./routes/ledger'))    } catch(e) { console.warn('ledger route:', e.message) }
try { app.use('/api/v1/payments', require('./routes/payments'))  } catch(e) { console.warn('payments route:', e.message) }
try { app.use('/api/v1/email',    require('./routes/email'))     } catch(e) { console.warn('email route:', e.message) }

// ── 404 ───────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error:`Route ${req.method} ${req.path} not found` }))

// ── Global error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  const id = require('crypto').randomUUID()
  console.error(`[ERROR] ${id}:`, err.message)
  if (process.env.NODE_ENV !== 'production') console.error(err.stack)
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    id,
  })
})

// ── Start server ──────────────────────────────────────────────────
function start() {
  app.listen(PORT, () => {
    console.log(`\n🌱 CarbonX Backend running on http://localhost:${PORT}`)
    console.log(`   Environment:    ${process.env.NODE_ENV || 'development'}`)
    console.log(`   Blockchain:     Polygon Mainnet (Chain ID: 137)`)
    console.log(`   Polygon RPC:    ${process.env.POLYGON_RPC || 'https://polygon-rpc.com (default)'}`)
    console.log(`   Health check:   http://localhost:${PORT}/health`)
    console.log(`   DB health:      http://localhost:${PORT}/health/db\n`)
  })

  // Test DB connection in background (non-blocking)
  try {
    const db = require('./db/client')
    db.raw('SELECT 1')
      .then(() => console.log('✅ PostgreSQL connected'))
      .catch(() => {
        console.warn('⚠️  PostgreSQL offline: serving verified fallback registry dataset')
      })
  } catch (err) {
    console.warn('⚠️  PostgreSQL check skipped')
  }
}

start()

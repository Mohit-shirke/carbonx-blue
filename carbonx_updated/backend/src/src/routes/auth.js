/**
 * CarbonX Auth Routes — /api/v1/auth
 * Registration, Login, Logout, Me, Password Reset
 * Security: Joi validation, bcrypt(12), JWT HTTP-only cookies,
 *           timing-safe comparison, brute-force protection via rate limiter
 */

const router  = require('express').Router()
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const Joi     = require('joi')
const crypto  = require('crypto')
const { v4: uuidv4 } = require('uuid')
const db      = require('../db/client')
const { requireAuth } = require('../middleware/auth')
const email   = require('../services/emailService')

// ── Validation schemas ────────────────────────────────────────────
const registerSchema = Joi.object({
  full_name:      Joi.string().min(2).max(255).trim().required(),
  email:          Joi.string().email().lowercase().required(),
  password:       Joi.string().min(8).max(128).required(),
  wallet_address: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).optional().allow(''),
  assigned_role:  Joi.string().valid('ngo','government','corporate','academic').required(),
})

const loginSchema = Joi.object({
  email:    Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
})

const resetRequestSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
})

const resetSchema = Joi.object({
  token:    Joi.string().length(64).required(),
  password: Joi.string().min(8).max(128).required(),
})

// ── Cookie options ────────────────────────────────────────────────
const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, assigned_role: user.assigned_role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// ── POST /register ────────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false })
    if (error) return res.status(422).json({ error:'Validation failed', details: error.details.map(d=>d.message) })

    const { full_name, email: userEmail, password, wallet_address, assigned_role } = value

    const existing = await db('users').where({ email: userEmail }).first()
    if (existing) return res.status(409).json({ error:'An account with this email already exists.' })

    if (wallet_address) {
      const walletTaken = await db('users').where({ wallet_address }).first()
      if (walletTaken) return res.status(409).json({ error:'This wallet address is already registered.' })
    }

    const password_hash = await bcrypt.hash(password, 12)
    const userId = uuidv4()

    const [user] = await db('users').insert({
      id: userId, full_name, email: userEmail, password_hash,
      wallet_address: wallet_address || null, assigned_role,
    }).returning(['id','email','full_name','assigned_role','wallet_address','created_at'])

    const token = signToken(user)
    res.cookie('carbonx_token', token, COOKIE_OPTS)

    // Send welcome email (non-blocking)
    email.sendWelcomeEmail({ email: userEmail, fullName: full_name, role: assigned_role })
      .catch(err => console.error('Welcome email failed:', err.message))

    return res.status(201).json({
      message: 'Account created successfully.',
      user: { id:user.id, email:user.email, full_name:user.full_name, assigned_role:user.assigned_role, wallet_address:user.wallet_address },
    })
  } catch (err) { next(err) }
})

// ── POST /login ───────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body)
    if (error) return res.status(422).json({ error: error.details[0].message })

    const { email: userEmail, password } = value
    const user = await db('users').where({ email: userEmail, is_active: true }).first()

    // Timing-safe: always run bcrypt even if user not found (prevents email enumeration)
    const hash = user?.password_hash || '$2a$12$invalidhashpadding000000000000000000000000000000000000'
    const match = await bcrypt.compare(password, hash)

    if (!user || !match) return res.status(401).json({ error:'Invalid email or password.' })

    const token = signToken(user)
    res.cookie('carbonx_token', token, COOKIE_OPTS)

    // Send security alert for login (optional, can be toggled)
    if (process.env.SEND_LOGIN_ALERTS === 'true') {
      email.sendSecurityAlertEmail({
        email: user.email, fullName: user.full_name,
        event: 'New login to your account',
        ip: req.ip, device: req.headers['user-agent'], time: new Date().toISOString(),
      }).catch(() => {})
    }

    return res.json({
      message: 'Signed in successfully.',
      user: { id:user.id, email:user.email, full_name:user.full_name, assigned_role:user.assigned_role, wallet_address:user.wallet_address },
    })
  } catch (err) { next(err) }
})

// ── POST /logout ──────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('carbonx_token', { httpOnly:true, sameSite:'strict' })
  res.json({ message:'Signed out successfully.' })
})

// ── GET /me ───────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('id','email','full_name','assigned_role','wallet_address','created_at')
      .first()
    if (!user) return res.status(404).json({ error:'User not found.' })
    res.json({ user })
  } catch (err) { next(err) }
})

// ── POST /forgot-password ─────────────────────────────────────────
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { error, value } = resetRequestSchema.validate(req.body)
    if (error) return res.status(422).json({ error: error.details[0].message })

    const user = await db('users').where({ email: value.email, is_active: true }).first()

    // Always return 200 to prevent email enumeration
    if (!user) return res.json({ message:'If that email exists, a reset link has been sent.' })

    const resetToken  = crypto.randomBytes(32).toString('hex')
    const tokenHash   = crypto.createHash('sha256').update(resetToken).digest('hex')
    const expiresAt   = new Date(Date.now() + 15 * 60 * 1000) // 15 min

    await db('password_reset_tokens').insert({
      id: uuidv4(), user_id: user.id,
      token_hash: tokenHash, expires_at: expiresAt, used: false,
    })

    email.sendPasswordResetEmail({
      email: user.email, fullName: user.full_name,
      resetToken, expiresIn: '15 minutes',
    }).catch(err => console.error('Reset email failed:', err.message))

    return res.json({ message:'If that email exists, a reset link has been sent.' })
  } catch (err) { next(err) }
})

// ── POST /reset-password ──────────────────────────────────────────
router.post('/reset-password', async (req, res, next) => {
  try {
    const { error, value } = resetSchema.validate(req.body)
    if (error) return res.status(422).json({ error: error.details[0].message })

    const tokenHash = crypto.createHash('sha256').update(value.token).digest('hex')

    const record = await db('password_reset_tokens')
      .where({ token_hash: tokenHash, used: false })
      .where('expires_at', '>', new Date())
      .first()

    if (!record) return res.status(400).json({ error:'Reset link is invalid or has expired.' })

    const password_hash = await bcrypt.hash(value.password, 12)
    await db('users').where({ id: record.user_id }).update({ password_hash })
    await db('password_reset_tokens').where({ id: record.id }).update({ used: true })

    return res.json({ message:'Password reset successfully. Please sign in.' })
  } catch (err) { next(err) }
})

module.exports = router

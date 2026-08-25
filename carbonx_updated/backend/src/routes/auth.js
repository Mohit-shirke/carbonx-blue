/**
 * /api/v1/auth – Registration and login endpoints
 * JWT issued inside secure HTTP-only cookies
 */

const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const Joi    = require('joi')
const { v4: uuidv4 } = require('uuid')
const db     = require('../db/client')
const { requireAuth } = require('../middleware/auth')

// ─── Validation schemas ───────────────────────────────────────────
const registerSchema = Joi.object({
  full_name:      Joi.string().min(2).max(255).required(),
  email:          Joi.string().email().required(),
  password:       Joi.string().min(8).max(128).required(),
  wallet_address: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).optional().allow(''),
  assigned_role:  Joi.string().valid('ngo', 'government', 'corporate', 'academic').required(),
})

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
})

// ─── Cookie options ───────────────────────────────────────────────
const COOKIE_OPTS = {
  httpOnly:  true,
  secure:    process.env.NODE_ENV === 'production',
  sameSite:  'lax',
  maxAge:    7 * 24 * 60 * 60 * 1000, // 7 days ms
}

function signToken(user) {
  return jwt.sign(
    {
      id:             user.id,
      email:          user.email,
      assigned_role:  user.assigned_role,
      wallet_address: user.wallet_address,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// ─── POST /register ───────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false })
    if (error) {
      return res.status(422).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message),
      })
    }

    const { full_name, email, password, wallet_address, assigned_role } = value

    // Check duplicate email
    const existing = await db('users').where({ email }).first()
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' })
    }

    // Check duplicate wallet (if provided)
    if (wallet_address) {
      const walletTaken = await db('users').where({ wallet_address }).first()
      if (walletTaken) {
        return res.status(409).json({ error: 'This wallet address is already registered.' })
      }
    }

    const password_hash = await bcrypt.hash(password, 12)

    const [user] = await db('users')
      .insert({
        id:             uuidv4(),
        full_name,
        email,
        password_hash,
        wallet_address: wallet_address || null,
        assigned_role,
      })
      .returning(['id', 'email', 'full_name', 'assigned_role', 'wallet_address', 'created_at'])

    const token = signToken(user)
    res.cookie('carbonx_token', token, COOKIE_OPTS)

    return res.status(201).json({
      message: 'Account created successfully.',
      user: {
        id:            user.id,
        email:         user.email,
        full_name:     user.full_name,
        assigned_role: user.assigned_role,
        wallet_address: user.wallet_address,
      },
    })
  } catch (err) {
    next(err)
  }
})

// ─── POST /login ──────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body)
    if (error) {
      return res.status(422).json({ error: error.details[0].message })
    }

    const { email, password } = value

    const user = await db('users').where({ email, is_active: true }).first()
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const token = signToken(user)
    res.cookie('carbonx_token', token, COOKIE_OPTS)

    return res.json({
      message: 'Signed in successfully.',
      user: {
        id:             user.id,
        email:          user.email,
        full_name:      user.full_name,
        assigned_role:  user.assigned_role,
        wallet_address: user.wallet_address,
      },
    })
  } catch (err) {
    next(err)
  }
})

// ─── POST /logout ─────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('carbonx_token', { httpOnly: true, sameSite: 'lax' })
  res.json({ message: 'Signed out successfully.' })
})

// ─── GET /me ──────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('id', 'email', 'full_name', 'assigned_role', 'wallet_address', 'created_at')
      .first()

    if (!user) return res.status(404).json({ error: 'User not found.' })
    res.json({ user })
  } catch (err) {
    next(err)
  }
})

module.exports = router
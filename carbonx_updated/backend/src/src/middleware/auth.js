/**
 * CarbonX Auth Middleware
 * JWT verification from HTTP-only cookie
 * Role-based access control (RBAC)
 */
const jwt = require('jsonwebtoken')
const db  = require('../db/client')

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.carbonx_token
    if (!token) return res.status(401).json({ error: 'Authentication required.' })

    let payload
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      const msg = err.name === 'TokenExpiredError' ? 'Session expired. Please sign in again.' : 'Invalid session.'
      res.clearCookie('carbonx_token', { httpOnly: true, sameSite: 'strict' })
      return res.status(401).json({ error: msg })
    }

    // Verify user still exists and is active
    const user = await db('users')
      .where({ id: payload.id, is_active: true })
      .select('id','email','full_name','assigned_role','wallet_address')
      .first()

    if (!user) {
      res.clearCookie('carbonx_token', { httpOnly: true, sameSite: 'strict' })
      return res.status(401).json({ error: 'Account not found or deactivated.' })
    }

    req.user = user
    next()
  } catch (err) { next(err) }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required.' })
    if (!roles.includes(req.user.assigned_role))
      return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}.` })
    next()
  }
}

// Convenience role guards
const requireNGO        = requireRole('ngo')
const requireGovernment = requireRole('government')
const requireAdmin      = requireRole('admin')

module.exports = { requireAuth, requireRole, requireNGO, requireGovernment, requireAdmin }

/**
 * JWT Authentication middleware
 * Reads token from HTTP-only cookie or Authorization Bearer header
 */

const jwt = require('jsonwebtoken')

/**
 * requireAuth – blocks unauthenticated requests
 */
function requireAuth(req, res, next) {
  try {
    const token = extractToken(req)
    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded  // { id, email, assigned_role, wallet_address }
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' })
    }
    return res.status(401).json({ error: 'Invalid authentication token.' })
  }
}

/**
 * requireRole – role-based access control guard
 * Usage: requireRole('government', 'academic')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' })
    }
    if (!roles.includes(req.user.assigned_role)) {
      return res.status(403).json({
        error: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.assigned_role}`,
      })
    }
    next()
  }
}

/**
 * optionalAuth – attaches user if token present, continues regardless
 */
function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req)
    if (token) {
      req.user = jwt.verify(token, process.env.JWT_SECRET)
    }
  } catch { /* ignore */ }
  next()
}

function extractToken(req) {
  // 1. HTTP-only cookie (preferred)
  if (req.cookies?.carbonx_token) return req.cookies.carbonx_token
  // 2. Authorization header
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7)
  return null
}

module.exports = { requireAuth, requireRole, optionalAuth }

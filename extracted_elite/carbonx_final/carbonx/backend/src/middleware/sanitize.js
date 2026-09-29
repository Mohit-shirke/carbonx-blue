/**
 * CarbonX Input Sanitization Middleware
 * XSS prevention, SQL injection prevention, prototype pollution prevention
 * Zero external dependencies — uses built-in string operations
 * Reference: OWASP Input Validation Cheat Sheet v2.0
 */

// ── XSS prevention — escape HTML special characters ───────────────
// O(n) time, O(n) space where n = string length
function escapeHTML(str) {
  if (typeof str !== 'string') return str
  const map = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;','`':'&#x60;','/':'&#x2F;' }
  return str.replace(/[&<>"'`/]/g, c => map[c])
}

// ── SQL injection prevention — detect dangerous patterns ──────────
// Uses trie-inspired regex alternation for O(n) single-pass scan
const SQL_PATTERNS = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT|XSS|--|\|\||;)\b)/gi
function containsSQLInjection(str) {
  if (typeof str !== 'string') return false
  return SQL_PATTERNS.test(str)
}

// ── Prototype pollution prevention ────────────────────────────────
const DANGEROUS_KEYS = new Set(['__proto__','constructor','prototype','__defineGetter__','__defineSetter__'])
function isDangerousKey(key) {
  return DANGEROUS_KEYS.has(key)
}

// ── Deep sanitize object — BFS traversal O(n) nodes ───────────────
function sanitizeObject(obj, depth = 0) {
  if (depth > 10) return {} // Prevent deeply nested DoS
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'string') return escapeHTML(obj.trim())
  if (typeof obj === 'number' || typeof obj === 'boolean') return obj
  if (Array.isArray(obj)) return obj.slice(0, 1000).map(v => sanitizeObject(v, depth + 1)) // Limit array size

  if (typeof obj === 'object') {
    const clean = {}
    for (const [key, val] of Object.entries(obj)) {
      if (isDangerousKey(key)) continue // Skip prototype pollution vectors
      if (typeof key !== 'string' || key.length > 200) continue // Limit key length
      clean[escapeHTML(key)] = sanitizeObject(val, depth + 1)
    }
    return clean
  }
  return obj
}

// ── Request size limits ───────────────────────────────────────────
function checkRequestSize(req) {
  const contentLength = parseInt(req.headers['content-length'] || '0')
  const MAX_BODY_SIZE = 1 * 1024 * 1024 // 1MB
  return contentLength <= MAX_BODY_SIZE
}

// ── Sanitize middleware ───────────────────────────────────────────
function sanitizeInput(req, res, next) {
  // Check request size
  if (!checkRequestSize(req)) {
    return res.status(413).json({ error: 'Request too large. Maximum 1MB.' })
  }

  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    try {
      req.body = sanitizeObject(req.body)
    } catch {
      return res.status(400).json({ error: 'Invalid request body.' })
    }
  }

  // Sanitize query params
  if (req.query) {
    for (const [key, val] of Object.entries(req.query)) {
      if (typeof val === 'string') {
        req.query[key] = escapeHTML(val.slice(0, 1000)) // Limit query param length
      }
    }
  }

  // Check for SQL injection in any string field
  const bodyStr = JSON.stringify(req.body || {})
  if (containsSQLInjection(bodyStr)) {
    console.warn(`[SECURITY] SQL injection pattern detected from IP: ${req.ip}`)
    return res.status(400).json({ error: 'Invalid characters detected in request.' })
  }

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  next()
}

// ── CSRF token generator (for state-changing requests) ────────────
const crypto = require('crypto')
function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex')
}

function validateCSRFToken(token, sessionToken) {
  if (!token || !sessionToken) return false
  // Timing-safe comparison
  try {
    return crypto.timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(sessionToken, 'hex'))
  } catch { return false }
}

module.exports = { sanitizeInput, sanitizeObject, escapeHTML, generateCSRFToken, validateCSRFToken }

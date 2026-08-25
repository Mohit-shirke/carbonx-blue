/**
 * CarbonX Email Service
 * Sends transactional emails using Nodemailer + SMTP (Gmail/SendGrid/Resend)
 * Falls back to console.log in development when SMTP not configured
 */

const nodemailer = require('nodemailer')

// ── Transport factory ─────────────────────────────────────────────
function createTransport() {
  if (!process.env.SMTP_HOST) {
    // Development fallback — log emails to console
    return nodemailer.createTransport({ jsonTransport: true })
  }
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' },
  })
}

const transporter = createTransport()

// ── Shared email wrapper ──────────────────────────────────────────
async function sendEmail({ to, subject, html, text }) {
  const msg = {
    from: `"CarbonX Registry" <${process.env.SMTP_FROM || 'noreply@carbonx.app'}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ''),
  }

  if (!process.env.SMTP_HOST) {
    console.log(`\n📧 [DEV EMAIL] To: ${to}\nSubject: ${subject}\n`)
    return { messageId: 'dev-' + Date.now() }
  }

  try {
    const info = await transporter.sendMail(msg)
    console.log(`📧 Email sent: ${info.messageId} → ${to}`)
    return info
  } catch (err) {
    console.error(`❌ Email failed to ${to}:`, err.message)
    // Don't throw — email failure should NOT break the main flow
  }
}

// ── Base HTML template ────────────────────────────────────────────
function baseTemplate(content) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>CarbonX</title>
  <style>
    body { margin:0; padding:0; background:#F9FAFB; font-family:'Helvetica Neue',Arial,sans-serif; color:#0F172A; }
    .container { max-width:560px; margin:32px auto; background:#FFFFFF; border-radius:16px; border:1px solid #E2E8F0; overflow:hidden; }
    .header { background:linear-gradient(135deg,#10B981,#059669); padding:28px 32px; text-align:center; }
    .header img { width:40px; height:40px; border-radius:10px; }
    .header h1 { color:#FFFFFF; font-size:20px; font-weight:700; margin:8px 0 0; letter-spacing:-0.3px; }
    .body { padding:28px 32px; }
    .body h2 { font-size:18px; font-weight:700; color:#0F172A; margin:0 0 8px; }
    .body p { font-size:14px; color:#64748B; line-height:1.6; margin:0 0 16px; }
    .card { background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:16px 20px; margin:16px 0; }
    .card-row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #E2E8F0; }
    .card-row:last-child { border-bottom:none; }
    .card-row .label { font-size:12px; color:#94A3B8; }
    .card-row .value { font-size:12px; font-weight:600; color:#0F172A; }
    .card-row .value.green { color:#10B981; }
    .btn { display:inline-block; background:#10B981; color:#FFFFFF; font-size:14px; font-weight:600; padding:12px 28px; border-radius:12px; text-decoration:none; margin:8px 0; }
    .footer { padding:20px 32px; text-align:center; border-top:1px solid #E2E8F0; }
    .footer p { font-size:11px; color:#94A3B8; margin:0; line-height:1.6; }
    .badge { display:inline-block; background:#10B981/10; color:#10B981; font-size:11px; font-weight:700; padding:3px 10px; border-radius:99px; border:1px solid #10B981/30; margin:4px 2px; }
    .warning { background:#FEF3C7; border:1px solid #F59E0B; border-radius:10px; padding:12px 16px; margin:16px 0; font-size:12px; color:#92400E; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:8px;">
        <span style="font-size:20px;">🌿</span>
      </div>
      <h1>CarbonX Registry</h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>
        CarbonX Blue Carbon Registry · Bengaluru, Karnataka, India<br/>
        AI-verified carbon credits on Polygon blockchain<br/>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color:#10B981;text-decoration:none;">Visit CarbonX</a>
        &nbsp;·&nbsp;
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/privacy" style="color:#94A3B8;text-decoration:none;">Privacy Policy</a>
        &nbsp;·&nbsp;
        <a href="mailto:support@carbonx.app" style="color:#94A3B8;text-decoration:none;">support@carbonx.app</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// ── 1. Welcome email — on registration ───────────────────────────
async function sendWelcomeEmail({ email, fullName, role }) {
  const ROLE_LABELS = {
    ngo:        'NGO / Project Proposer',
    government: 'Government Validator',
    corporate:  'Corporate Enterprise Buyer',
    academic:   'Independent Academic Auditor',
  }
  const html = baseTemplate(`
    <h2>Welcome to CarbonX, ${fullName}! 🌿</h2>
    <p>Your account has been created successfully. You are now part of India's most transparent blue carbon registry.</p>
    <div class="card">
      <div class="card-row"><span class="label">Name</span><span class="value">${fullName}</span></div>
      <div class="card-row"><span class="label">Email</span><span class="value">${email}</span></div>
      <div class="card-row"><span class="label">Role</span><span class="value green">${ROLE_LABELS[role] || role}</span></div>
      <div class="card-row"><span class="label">Status</span><span class="value green">Active ✓</span></div>
    </div>
    <p>Here is what you can do with your new account:</p>
    <p>
      <span class="badge">🛒 Browse Marketplace</span>
      <span class="badge">🛰️ View MRV Pipeline</span>
      <span class="badge">🔒 On-chain Ledger</span>
      <span class="badge">🤖 Mira AI</span>
    </p>
    <a class="btn" href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/marketplace">Explore Carbon Marketplace →</a>
    <div class="warning">
      ⚠️ If you did not create this account, please contact us immediately at security@carbonx.app
    </div>
  `)
  return sendEmail({ to: email, subject: '🌿 Welcome to CarbonX — Your Account is Ready', html })
}

// ── 2. Purchase confirmation email ───────────────────────────────
async function sendPurchaseConfirmationEmail({ email, fullName, project, amount, totalUSD, txHash, tokenId }) {
  const html = baseTemplate(`
    <h2>Purchase Confirmed! 🎉</h2>
    <p>Hi ${fullName}, your carbon credit purchase has been confirmed and tokens are being minted to your wallet.</p>
    <div class="card">
      <div class="card-row"><span class="label">Project</span><span class="value">${project}</span></div>
      <div class="card-row"><span class="label">Credits Purchased</span><span class="value green">${amount} tCO₂e</span></div>
      <div class="card-row"><span class="label">Amount Paid</span><span class="value green">$${totalUSD}</span></div>
      <div class="card-row"><span class="label">Token Standard</span><span class="value">ERC-1155 #${tokenId}</span></div>
      <div class="card-row"><span class="label">Transaction Hash</span><span class="value" style="font-family:monospace;font-size:11px;">${txHash || 'Pending…'}</span></div>
      <div class="card-row"><span class="label">Date</span><span class="value">${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</span></div>
    </div>
    <p>Your credits will appear in your wallet within 1–2 minutes. You can view them on the Polygon Amoy blockchain explorer.</p>
    <a class="btn" href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/ledger">View in Ledger →</a>
    <p style="margin-top:16px;font-size:12px;color:#94A3B8;">
      When you're ready to claim your carbon offset, visit the Ledger page to retire your credits and generate an on-chain retirement certificate.
    </p>
  `)
  return sendEmail({ to: email, subject: `✅ Purchase Confirmed — ${amount} tCO₂e from ${project}`, html })
}

// ── 3. Retirement confirmation email ─────────────────────────────
async function sendRetirementEmail({ email, fullName, project, amount, note, txHash, retirementId }) {
  const html = baseTemplate(`
    <h2>Carbon Credits Retired Successfully 🔒</h2>
    <p>Hi ${fullName}, your carbon credits have been permanently retired (burned) on the Polygon blockchain.</p>
    <div class="card">
      <div class="card-row"><span class="label">Retirement ID</span><span class="value" style="font-family:monospace;">${retirementId}</span></div>
      <div class="card-row"><span class="label">Project</span><span class="value">${project}</span></div>
      <div class="card-row"><span class="label">Credits Retired</span><span class="value green">${amount} tCO₂e</span></div>
      <div class="card-row"><span class="label">Retirement Note</span><span class="value">${note}</span></div>
      <div class="card-row"><span class="label">Tx Hash</span><span class="value" style="font-family:monospace;font-size:11px;">${txHash || 'Pending…'}</span></div>
      <div class="card-row"><span class="label">Status</span><span class="value green">Permanently Retired ✓</span></div>
      <div class="card-row"><span class="label">Date</span><span class="value">${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</span></div>
    </div>
    <p>This retirement is <strong>immutable and publicly verifiable</strong> on the Polygon blockchain. The credits can never be reused or transferred again.</p>
    <a class="btn" href="https://www.oklink.com/amoy/tx/${txHash || ''}">Verify on OKLink Explorer →</a>
    <a class="btn" href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/ledger" style="background:#0F172A;margin-left:8px;">View Ledger →</a>
    <div class="card" style="margin-top:16px;background:#ECFDF5;border-color:#10B981;">
      <p style="margin:0;font-size:12px;color:#065F46;">
        🌿 <strong>Environmental Impact:</strong> You have permanently offset ${amount} metric tonnes of CO₂ equivalent, helping protect India's blue carbon ecosystems.
      </p>
    </div>
  `)
  return sendEmail({ to: email, subject: `🔒 Retirement Certificate — ${amount} tCO₂e Permanently Offset`, html })
}

// ── 4. MRV validation result email ───────────────────────────────
async function sendMRVResultEmail({ email, fullName, project, ndviScore, status, details }) {
  const passed = status === 'verified'
  const html = baseTemplate(`
    <h2>MRV Validation ${passed ? 'Passed ✅' : 'Failed ❌'}</h2>
    <p>Hi ${fullName}, the AI satellite MRV validation for your project has completed.</p>
    <div class="card">
      <div class="card-row"><span class="label">Project</span><span class="value">${project}</span></div>
      <div class="card-row"><span class="label">NDVI Score</span><span class="value ${passed ? 'green' : ''}">${ndviScore}</span></div>
      <div class="card-row"><span class="label">Threshold</span><span class="value">≥ 0.80</span></div>
      <div class="card-row"><span class="label">Status</span><span class="value ${passed ? 'green' : ''}">${passed ? 'VERIFIED' : 'REVIEW REQUIRED'}</span></div>
      <div class="card-row"><span class="label">Date</span><span class="value">${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</span></div>
    </div>
    ${passed
      ? `<p>Congratulations! Your project has passed the satellite MRV validation. Credits are now eligible for minting.</p>`
      : `<p>Your project's NDVI score (${ndviScore}) did not meet the minimum threshold (0.80). Please review the details below and address any issues before resubmitting.</p>`
    }
    ${details ? `<p style="font-size:12px;color:#94A3B8;">${details}</p>` : ''}
    <a class="btn" href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/mrv">View MRV Dashboard →</a>
  `)
  return sendEmail({ to: email, subject: `🛰️ MRV Validation ${passed ? 'Passed' : 'Failed'} — ${project}`, html })
}

// ── 5. Password reset email ───────────────────────────────────────
async function sendPasswordResetEmail({ email, fullName, resetToken, expiresIn = '15 minutes' }) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`
  const html = baseTemplate(`
    <h2>Reset Your Password 🔑</h2>
    <p>Hi ${fullName}, we received a request to reset your CarbonX password.</p>
    <p>Click the button below to set a new password. This link will expire in <strong>${expiresIn}</strong>.</p>
    <a class="btn" href="${resetUrl}">Reset Password →</a>
    <div class="warning">
      ⚠️ If you did not request a password reset, please ignore this email and contact support@carbonx.app immediately.
      Your password will not be changed unless you click the link above.
    </div>
    <p style="font-size:11px;color:#94A3B8;margin-top:16px;">
      If the button does not work, copy and paste this URL into your browser:<br/>
      <span style="font-family:monospace;word-break:break-all;">${resetUrl}</span>
    </p>
  `)
  return sendEmail({ to: email, subject: '🔑 Password Reset Request — CarbonX', html })
}

// ── 6. Security alert email ───────────────────────────────────────
async function sendSecurityAlertEmail({ email, fullName, event, ip, device, time }) {
  const html = baseTemplate(`
    <h2>Security Alert 🚨</h2>
    <p>Hi ${fullName}, we detected a security event on your CarbonX account.</p>
    <div class="card">
      <div class="card-row"><span class="label">Event</span><span class="value">${event}</span></div>
      <div class="card-row"><span class="label">IP Address</span><span class="value">${ip || 'Unknown'}</span></div>
      <div class="card-row"><span class="label">Device</span><span class="value">${device || 'Unknown'}</span></div>
      <div class="card-row"><span class="label">Time</span><span class="value">${time || new Date().toISOString()}</span></div>
    </div>
    <div class="warning">
      If this was not you, please change your password immediately and contact security@carbonx.app
    </div>
    <a class="btn" href="mailto:security@carbonx.app" style="background:#EF4444;">Report Security Issue →</a>
  `)
  return sendEmail({ to: email, subject: '🚨 Security Alert — CarbonX Account Activity', html })
}

// ── 7. Newsletter subscription confirmation ───────────────────────
async function sendNewsletterConfirmEmail({ email }) {
  const html = baseTemplate(`
    <h2>You're subscribed! 📰</h2>
    <p>Thank you for subscribing to the CarbonX newsletter. You'll receive the latest updates on:</p>
    <p>
      <span class="badge">🌿 Blue carbon science</span>
      <span class="badge">📊 Market insights</span>
      <span class="badge">🛰️ MRV technology</span>
      <span class="badge">🌍 Project updates</span>
    </p>
    <a class="btn" href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/blog">Read Latest Articles →</a>
    <p style="font-size:12px;color:#94A3B8;margin-top:16px;">
      You can unsubscribe at any time by clicking the unsubscribe link in any of our emails.
    </p>
  `)
  return sendEmail({ to: email, subject: '📰 Subscribed to CarbonX Newsletter', html })
}

// ── 8. Contact form confirmation ──────────────────────────────────
async function sendContactConfirmEmail({ email, name, subject }) {
  const html = baseTemplate(`
    <h2>We received your message 📩</h2>
    <p>Hi ${name}, thank you for reaching out to CarbonX. We have received your message and will respond within 24 hours.</p>
    <div class="card">
      <div class="card-row"><span class="label">Subject</span><span class="value">${subject}</span></div>
      <div class="card-row"><span class="label">Reference</span><span class="value" style="font-family:monospace;">#CX-${Date.now().toString(36).toUpperCase()}</span></div>
      <div class="card-row"><span class="label">Expected Reply</span><span class="value">Within 24 hours</span></div>
    </div>
    <p>In the meantime, you can ask our AI assistant Mira for instant answers to most platform questions.</p>
    <a class="btn" href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">Go to CarbonX →</a>
  `)
  return sendEmail({ to: email, subject: '📩 We received your message — CarbonX Support', html })
}

module.exports = {
  sendWelcomeEmail,
  sendPurchaseConfirmationEmail,
  sendRetirementEmail,
  sendMRVResultEmail,
  sendPasswordResetEmail,
  sendSecurityAlertEmail,
  sendNewsletterConfirmEmail,
  sendContactConfirmEmail,
}

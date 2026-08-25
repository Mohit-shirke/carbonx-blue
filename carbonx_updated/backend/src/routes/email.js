/**
 * CarbonX Email Routes — /api/v1/email
 * Newsletter subscription, contact form
 */
const router = require('express').Router()
const Joi    = require('joi')
const { v4: uuidv4 } = require('uuid')
const db     = require('../db/client')
const email  = require('../services/emailService')

const subscribeSchema = Joi.object({ email: Joi.string().email().lowercase().required() })
const contactSchema   = Joi.object({
  name:    Joi.string().min(2).max(100).trim().required(),
  email:   Joi.string().email().lowercase().required(),
  subject: Joi.string().min(2).max(200).trim().required(),
  message: Joi.string().min(10).max(5000).trim().required(),
})

// POST /api/v1/email/subscribe
router.post('/subscribe', async (req, res, next) => {
  try {
    const { error, value } = subscribeSchema.validate(req.body)
    if (error) return res.status(422).json({ error: error.details[0].message })

    // Check if already subscribed (idempotent)
    const exists = await db('newsletter_subscribers').where({ email: value.email }).first()
    if (exists) return res.json({ message: 'You are already subscribed.' })

    await db('newsletter_subscribers').insert({
      id: uuidv4(), email: value.email, subscribed_at: new Date()
    })

    email.sendNewsletterConfirmEmail({ email: value.email }).catch(() => {})

    return res.json({ message: 'Subscribed successfully! Check your email for confirmation.' })
  } catch (err) { next(err) }
})

// POST /api/v1/email/contact
router.post('/contact', async (req, res, next) => {
  try {
    const { error, value } = contactSchema.validate(req.body)
    if (error) return res.status(422).json({ error: error.details[0].message })

    // Save to DB
    await db('contact_submissions').insert({
      id: uuidv4(), name: value.name, email: value.email,
      subject: value.subject, message: value.message, created_at: new Date()
    })

    // Send confirmation to user
    email.sendContactConfirmEmail({ email: value.email, name: value.name, subject: value.subject }).catch(() => {})

    // Notify admin
    email.sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@carbonx.app',
      subject: `[CarbonX Contact] ${value.subject} — from ${value.name}`,
      html: `<p><b>From:</b> ${value.name} (${value.email})</p><p><b>Subject:</b> ${value.subject}</p><p><b>Message:</b></p><p>${value.message.replace(/\n/g,'<br/>')}</p>`,
    }).catch(() => {})

    return res.json({ message: 'Message sent! We will reply within 24 hours.' })
  } catch (err) { next(err) }
})

module.exports = router

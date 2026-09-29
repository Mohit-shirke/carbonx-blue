/**
 * CarbonX Email Routes — /api/v1/email
 * Newsletter subscription + contact form
 * Sanitized + validated
 */
const router  = require('express').Router()
const Joi     = require('joi')
const { v4: uuidv4 } = require('uuid')
const db      = require('../db/client')
const emailSvc= require('../services/emailService')

const subscribeSchema = Joi.object({ email: Joi.string().email().lowercase().max(320).required() })
const contactSchema   = Joi.object({
  name:    Joi.string().min(2).max(100).trim().required(),
  email:   Joi.string().email().lowercase().max(320).required(),
  subject: Joi.string().min(2).max(200).trim().required(),
  message: Joi.string().min(10).max(5000).trim().required(),
})

// POST /api/v1/email/subscribe
router.post('/subscribe', async (req, res, next) => {
  try {
    const { error, value } = subscribeSchema.validate(req.body)
    if (error) return res.status(422).json({ error: error.details[0].message })
    const exists = await db('newsletter_subscribers').where({ email: value.email }).first()
    if (exists) return res.json({ message:'You are already subscribed.' })
    await db('newsletter_subscribers').insert({ id: uuidv4(), email: value.email, subscribed_at: new Date() })
    emailSvc.sendNewsletterConfirmEmail({ email: value.email }).catch(() => {})
    return res.json({ message:'Subscribed successfully! Check your email for confirmation.' })
  } catch (err) { next(err) }
})

// POST /api/v1/email/contact
router.post('/contact', async (req, res, next) => {
  try {
    const { error, value } = contactSchema.validate(req.body)
    if (error) return res.status(422).json({ error: error.details[0].message })
    await db('contact_submissions').insert({ id: uuidv4(), name: value.name, email: value.email, subject: value.subject, message: value.message, created_at: new Date() })
    emailSvc.sendContactConfirmEmail({ email: value.email, name: value.name, subject: value.subject }).catch(() => {})
    return res.json({ message:'Message sent! We will reply within 24 hours.' })
  } catch (err) { next(err) }
})

module.exports = router

/**
 * CarbonX Payments — /api/v1/payments
 * Stripe payment intent + webhook (verified signature)
 * On success: mint tokens + send purchase email
 */
const router  = require('express').Router()
const Joi     = require('joi')
const { v4: uuidv4 } = require('uuid')
const db      = require('../db/client')
const { requireAuth } = require('../middleware/auth')
const email   = require('../services/emailService')

let stripe
try {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
} catch { /* Stripe optional in dev */ }

const intentSchema = Joi.object({
  project_id: Joi.string().uuid().required(),
  amount_tons: Joi.number().min(1).max(100000).required(),
})

// POST /api/v1/payments/intent
router.post('/intent', requireAuth, async (req, res, next) => {
  try {
    const { error, value } = intentSchema.validate(req.body)
    if (error) return res.status(422).json({ error: error.details[0].message })

    const project = await db('projects').where({ id: value.project_id, status: 'active' }).first()
    if (!project) return res.status(404).json({ error: 'Project not found or not active.' })
    if (project.available_credits < value.amount_tons)
      return res.status(400).json({ error: 'Insufficient credits available.' })

    const subtotal    = value.amount_tons * project.price_per_ton_usd
    const fee         = Math.round(subtotal * 0.029 * 100) // 2.9% in cents
    const totalCents  = Math.round(subtotal * 100) + fee

    if (!stripe) {
      // Dev mode fallback
      return res.json({ client_secret: 'dev_secret_' + uuidv4(), amount_usd_cents: totalCents })
    }

    const intent = await stripe.paymentIntents.create({
      amount:   totalCents,
      currency: 'usd',
      metadata: {
        user_id:     req.user.id,
        project_id:  value.project_id,
        amount_tons: value.amount_tons,
        fee_cents:   fee,
      },
    })

    return res.json({ client_secret: intent.client_secret, amount_usd_cents: totalCents })
  } catch (err) { next(err) }
})

// POST /api/v1/payments/webhook (raw body)
router.post('/webhook', async (req, res, next) => {
  if (!stripe) return res.json({ received: true })

  const sig = req.headers['stripe-signature']
  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).json({ error: `Webhook signature verification failed.` })
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object
    const { user_id, project_id, amount_tons } = intent.metadata
    try {
      const [user, project] = await Promise.all([
        db('users').where({ id: user_id }).first(),
        db('projects').where({ id: project_id }).first(),
      ])
      // Record purchase
      const purchaseId = uuidv4()
      await db('purchases').insert({
        id: purchaseId, user_id, project_id,
        amount_tons: parseInt(amount_tons),
        amount_usd:  intent.amount / 100,
        stripe_payment_intent_id: intent.id,
        status: 'completed', created_at: new Date(),
      })
      // Send confirmation email
      if (user && project) {
        email.sendPurchaseConfirmationEmail({
          email:   user.email,
          fullName: user.full_name,
          project: project.name,
          amount:  amount_tons,
          totalUSD: (intent.amount / 100).toFixed(2),
          txHash:  null,
          tokenId: project.token_id,
        }).catch(() => {})
      }
    } catch (err) {
      console.error('Webhook processing error:', err.message)
    }
  }

  res.json({ received: true })
})

module.exports = router

/**
 * CarbonX — Complete database schema
 * Includes: users, projects, purchases, retirements, password_reset_tokens,
 *           newsletter_subscribers, contact_submissions, mrv_runs, audit_logs
 */
exports.up = async function(knex) {

  // ── users ───────────────────────────────────────────────────────
  await knex.schema.createTable('users', t => {
    t.uuid('id').primary()
    t.string('full_name',255).notNullable()
    t.string('email',320).notNullable().unique()
    t.string('password_hash',255).notNullable()
    t.string('wallet_address',42).unique().nullable()
    t.enu('assigned_role',['ngo','government','corporate','academic','admin']).notNullable().defaultTo('corporate')
    t.boolean('is_active').notNullable().defaultTo(true)
    t.boolean('email_verified').notNullable().defaultTo(false)
    t.timestamps(true, true)
  })

  // ── projects ────────────────────────────────────────────────────
  await knex.schema.createTable('projects', t => {
    t.uuid('id').primary()
    t.string('name',255).notNullable()
    t.text('description')
    t.string('location',255)
    t.string('coordinates',100)
    t.decimal('area_sq_km',10,2)
    t.enu('validator_badge',['Verra','CCTS','Gold Standard']).notNullable()
    t.integer('token_id').notNullable().unique()
    t.integer('target_credits').notNullable().defaultTo(0)
    t.integer('issued_credits').notNullable().defaultTo(0)
    t.integer('retired_credits').notNullable().defaultTo(0)
    t.decimal('price_per_ton_usd',10,2).notNullable()
    t.decimal('ndvi_score',4,2).defaultTo(0)
    t.enu('status',['active','soldout','upcoming','pending','rejected']).defaultTo('pending')
    t.enu('ecosystem',['mangrove','seagrass','wetland']).defaultTo('mangrove')
    t.integer('co2_per_year').defaultTo(0)
    t.integer('biodiversity_score').defaultTo(0)
    t.timestamps(true, true)
  })

  // ── purchases ───────────────────────────────────────────────────
  await knex.schema.createTable('purchases', t => {
    t.uuid('id').primary()
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('RESTRICT')
    t.integer('amount_tons').notNullable()
    t.decimal('amount_usd',10,2).notNullable()
    t.decimal('fee_usd',10,2).defaultTo(0)
    t.string('stripe_payment_intent_id',255).nullable()
    t.string('tx_hash',100).nullable()
    t.enu('status',['pending','completed','failed','refunded']).defaultTo('pending')
    t.string('payment_method',50).defaultTo('card')
    t.timestamps(true, true)
  })

  // ── retirements ─────────────────────────────────────────────────
  await knex.schema.createTable('retirements', t => {
    t.uuid('id').primary()
    t.string('retirement_id',50).notNullable().unique()
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('RESTRICT')
    t.integer('token_id').notNullable()
    t.integer('amount').notNullable()
    t.text('note').notNullable()
    t.string('tx_hash',100).nullable()
    t.string('beneficiary',255).nullable()
    t.timestamps(true, true)
  })

  // ── mrv_runs ────────────────────────────────────────────────────
  await knex.schema.createTable('mrv_runs', t => {
    t.uuid('id').primary()
    t.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE')
    t.uuid('run_by').nullable().references('id').inTable('users').onDelete('SET NULL')
    t.decimal('ndvi_score',4,3).nullable()
    t.enu('status',['pending','running','verified','failed']).defaultTo('pending')
    t.text('log').nullable()
    t.string('satellite_source',100).defaultTo('Sentinel-2')
    t.string('signature',255).nullable()
    t.timestamps(true, true)
  })

  // ── password_reset_tokens ────────────────────────────────────────
  await knex.schema.createTable('password_reset_tokens', t => {
    t.uuid('id').primary()
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.string('token_hash',64).notNullable().unique()
    t.timestamp('expires_at').notNullable()
    t.boolean('used').notNullable().defaultTo(false)
    t.timestamp('created_at').defaultTo(knex.fn.now())
  })

  // ── newsletter_subscribers ───────────────────────────────────────
  await knex.schema.createTable('newsletter_subscribers', t => {
    t.uuid('id').primary()
    t.string('email',320).notNullable().unique()
    t.timestamp('subscribed_at').defaultTo(knex.fn.now())
    t.boolean('active').notNullable().defaultTo(true)
  })

  // ── contact_submissions ──────────────────────────────────────────
  await knex.schema.createTable('contact_submissions', t => {
    t.uuid('id').primary()
    t.string('name',255).notNullable()
    t.string('email',320).notNullable()
    t.string('subject',200).notNullable()
    t.text('message').notNullable()
    t.enu('status',['open','in_progress','resolved']).defaultTo('open')
    t.timestamp('created_at').defaultTo(knex.fn.now())
  })

  // ── audit_logs ───────────────────────────────────────────────────
  await knex.schema.createTable('audit_logs', t => {
    t.uuid('id').primary()
    t.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL')
    t.string('action',100).notNullable()
    t.string('resource_type',100).nullable()
    t.string('resource_id',255).nullable()
    t.jsonb('meta').nullable()
    t.string('ip_address',45).nullable()
    t.text('user_agent').nullable()
    t.timestamp('created_at').defaultTo(knex.fn.now())
    t.index(['user_id','action'])
    t.index('created_at')
  })

  console.log('✅ All tables created successfully')
}

exports.down = async function(knex) {
  const tables = [
    'audit_logs','contact_submissions','newsletter_subscribers',
    'password_reset_tokens','mrv_runs','retirements','purchases','projects','users'
  ]
  for (const table of tables) await knex.schema.dropTableIfExists(table)
}

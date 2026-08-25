/**
 * CarbonX database schema migration
 * Tables: users, projects, carbon_credits, retirements, mrv_logs, payments
 */

exports.up = async function (knex) {
  // ── Enable UUID extension ─────────────────────────────────────
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

  // ── users ─────────────────────────────────────────────────────
  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    t.string('full_name', 255).notNullable()
    t.string('email', 320).notNullable().unique()
    t.string('password_hash', 255).notNullable()
    t.string('wallet_address', 42).nullable().unique()
    t.enu('assigned_role', ['ngo', 'government', 'corporate', 'academic']).notNullable()
    t.boolean('email_verified').defaultTo(false)
    t.boolean('is_active').defaultTo(true)
    t.timestamps(true, true) // created_at, updated_at
  })

  // ── projects ──────────────────────────────────────────────────
  await knex.schema.createTable('projects', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    t.string('name', 255).notNullable()
    t.text('description').nullable()
    t.string('location', 255).nullable()
    t.string('coordinates', 100).nullable()
    t.decimal('area_sq_km', 10, 2).nullable()
    t.enu('validator_badge', ['Verra', 'CCTS', 'Gold Standard']).nullable()
    t.enu('status', ['proposed', 'pending_mrv', 'verified', 'rejected', 'active']).defaultTo('proposed')
    t.uuid('proposer_id').references('id').inTable('users').onDelete('SET NULL').nullable()
    t.string('metadata_uri', 512).nullable()        // IPFS hash
    t.integer('erc1155_token_id').nullable()
    t.bigint('target_credits').defaultTo(0)
    t.bigint('issued_credits').defaultTo(0)
    t.decimal('price_per_ton_usd', 10, 2).defaultTo(0)
    t.decimal('ndvi_score', 4, 2).nullable()
    t.timestamp('verified_at').nullable()
    t.timestamps(true, true)
  })

  // ── carbon_credits ────────────────────────────────────────────
  await knex.schema.createTable('carbon_credits', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    t.uuid('project_id').references('id').inTable('projects').onDelete('CASCADE').notNullable()
    t.uuid('owner_id').references('id').inTable('users').onDelete('SET NULL').nullable()
    t.string('owner_wallet', 42).nullable()
    t.integer('token_id').notNullable()
    t.bigint('amount').notNullable()
    t.enu('status', ['active', 'retired', 'transferred']).defaultTo('active')
    t.string('tx_hash', 66).nullable()
    t.timestamps(true, true)
  })

  // ── retirements ───────────────────────────────────────────────
  await knex.schema.createTable('retirements', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    t.uuid('project_id').references('id').inTable('projects').onDelete('SET NULL').nullable()
    t.uuid('user_id').references('id').inTable('users').onDelete('SET NULL').nullable()
    t.string('retiree_wallet', 42).notNullable()
    t.integer('token_id').notNullable()
    t.bigint('amount').notNullable()
    t.text('retirement_note').nullable()
    t.string('tx_hash', 66).nullable()
    t.integer('block_number').nullable()
    t.timestamp('retired_at').defaultTo(knex.fn.now())
    t.timestamps(true, true)
  })

  // ── mrv_logs ──────────────────────────────────────────────────
  await knex.schema.createTable('mrv_logs', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    t.uuid('project_id').references('id').inTable('projects').onDelete('CASCADE').notNullable()
    t.uuid('validator_id').references('id').inTable('users').onDelete('SET NULL').nullable()
    t.enu('result', ['pending', 'approved', 'rejected']).defaultTo('pending')
    t.decimal('ndvi_score', 4, 2).nullable()
    t.text('pipeline_output').nullable()       // JSON serialized logs
    t.string('validation_signature', 130).nullable()
    t.timestamps(true, true)
  })

  // ── payments ──────────────────────────────────────────────────
  await knex.schema.createTable('payments', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    t.uuid('user_id').references('id').inTable('users').onDelete('SET NULL').nullable()
    t.uuid('project_id').references('id').inTable('projects').onDelete('SET NULL').nullable()
    t.string('stripe_payment_intent_id', 100).nullable().unique()
    t.integer('amount_cents').notNullable()
    t.string('currency', 3).defaultTo('usd')
    t.bigint('token_amount').notNullable()
    t.string('buyer_wallet', 42).nullable()
    t.enu('status', ['pending', 'succeeded', 'failed', 'refunded']).defaultTo('pending')
    t.string('mint_tx_hash', 66).nullable()
    t.timestamps(true, true)
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('payments')
  await knex.schema.dropTableIfExists('mrv_logs')
  await knex.schema.dropTableIfExists('retirements')
  await knex.schema.dropTableIfExists('carbon_credits')
  await knex.schema.dropTableIfExists('projects')
  await knex.schema.dropTableIfExists('users')
}

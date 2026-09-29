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

// Append new tables for advanced features
exports.up_v2 = async function(knex) {
  // Credit serials — for double-counting prevention
  if (!(await knex.schema.hasTable('credit_serials'))) {
    await knex.schema.createTable('credit_serials', t => {
      t.uuid('id').primary()
      t.string('serial', 100).notNullable().unique()
      t.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('RESTRICT')
      t.integer('vintage_year').notNullable()
      t.uuid('monitoring_period_id').nullable()
      t.enu('status',['issued','available','reserved','transferred','retired','cancelled','reversed','under_review']).defaultTo('issued')
      t.string('registry_status', 50).defaultTo('active')
      t.string('external_registry_id', 100).nullable()
      t.uuid('current_holder_id').nullable().references('id').inTable('users')
      t.timestamps(true, true)
      t.index(['project_id', 'vintage_year'])
      t.index('status')
    })
  }

  // Evidence graph nodes
  if (!(await knex.schema.hasTable('evidence_nodes'))) {
    await knex.schema.createTable('evidence_nodes', t => {
      t.uuid('id').primary()
      t.uuid('graph_id').notNullable()
      t.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE')
      t.string('type', 100).notNullable()
      t.string('hash', 64).notNullable()
      t.jsonb('data').notNullable()
      t.jsonb('parent_ids').defaultTo('[]')
      t.jsonb('metadata').defaultTo('{}')
      t.timestamps(true, true)
      t.index('graph_id')
      t.index('project_id')
    })
  }

  // Carbon calculations
  if (!(await knex.schema.hasTable('carbon_calculations'))) {
    await knex.schema.createTable('carbon_calculations', t => {
      t.uuid('id').primary()
      t.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE')
      t.uuid('mrv_run_id').nullable().references('id').inTable('mrv_runs').onDelete('SET NULL')
      t.string('methodology', 100).defaultTo('BEE_BM_FR05_001')
      t.decimal('gross_co2e', 12, 3).notNullable()
      t.decimal('net_co2e', 12, 3).notNullable()
      t.decimal('creditable_co2e', 12, 3).notNullable()
      t.decimal('leakage_deduction', 12, 3)
      t.decimal('uncertainty_deduction', 12, 3)
      t.decimal('buffer_contribution', 12, 3)
      t.decimal('confidence_score', 5, 2)
      t.jsonb('inputs').defaultTo('{}')
      t.jsonb('calculation_detail').defaultTo('{}')
      t.string('graph_root_hash', 64).nullable()
      t.timestamps(true, true)
    })
  }

  // Permanence monitoring events
  if (!(await knex.schema.hasTable('permanence_events'))) {
    await knex.schema.createTable('permanence_events', t => {
      t.uuid('id').primary()
      t.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE')
      t.enu('event_type',['MINOR_DECLINE','MODERATE_DECLINE','MAJOR_DECLINE','CATASTROPHIC','STORM','ENCROACHMENT','MONITORING_UPDATE']).notNullable()
      t.enu('severity',['INFO','WARNING','HIGH','CRITICAL']).defaultTo('INFO')
      t.decimal('ndvi_before', 4, 3).nullable()
      t.decimal('ndvi_after', 4, 3).nullable()
      t.decimal('estimated_loss_ha', 10, 2).nullable()
      t.decimal('estimated_loss_co2e', 12, 3).nullable()
      t.text('description').nullable()
      t.enu('status',['open','investigating','resolved','closed']).defaultTo('open')
      t.timestamp('detected_at').defaultTo(knex.fn.now())
      t.timestamps(true, true)
    })
  }

  // Grievances
  if (!(await knex.schema.hasTable('grievances'))) {
    await knex.schema.createTable('grievances', t => {
      t.uuid('id').primary()
      t.string('reference_id', 50).notNullable().unique()
      t.uuid('project_id').nullable().references('id').inTable('projects').onDelete('SET NULL')
      t.enu('type',['land_rights','community','environmental','data','fraud','double_counting','boundary','other']).notNullable()
      t.text('description').notNullable()
      t.text('evidence').nullable()
      t.string('contact_email', 320).nullable()
      t.boolean('anonymous').defaultTo(false)
      t.enu('status',['open','in_progress','resolved','closed']).defaultTo('open')
      t.text('resolution').nullable()
      t.timestamp('resolved_at').nullable()
      t.timestamps(true, true)
    })
  }

  // Verification cases
  if (!(await knex.schema.hasTable('verification_cases'))) {
    await knex.schema.createTable('verification_cases', t => {
      t.uuid('id').primary()
      t.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE')
      t.uuid('mrv_run_id').nullable()
      t.string('verifier_body', 255).nullable()
      t.string('verifier_name', 255).nullable()
      t.decimal('creditable_tonnes', 12, 3).nullable()
      t.enu('status',['pending_review','under_review','corrective_action','approved','rejected']).defaultTo('pending_review')
      t.text('findings').nullable()
      t.text('corrective_actions').nullable()
      t.timestamp('deadline').nullable()
      t.timestamp('verified_at').nullable()
      t.timestamps(true, true)
    })
  }

  console.log('✅ Advanced feature tables created')
}

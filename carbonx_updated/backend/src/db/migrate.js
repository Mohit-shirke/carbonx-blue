require('dotenv').config()
const db = require('./client')

async function up() {
  console.log('\n🌱 CarbonX Database Migration Runner')
  console.log('=====================================\n')

  await db.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')
  console.log('  ✅ pgcrypto extension enabled')

  // Users
  if (!(await db.schema.hasTable('users'))) {
    await db.schema.createTable('users', t => {
      t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'))
      t.string('full_name', 200).notNullable()
      t.string('email', 320).notNullable().unique()
      t.string('password_hash', 255).notNullable()
      t.enu('assigned_role', ['corporate','ngo','verifier','admin']).defaultTo('corporate')
      t.string('wallet_address', 42).nullable()
      t.boolean('is_active').defaultTo(true)
      t.boolean('email_verified').defaultTo(false)
      t.timestamps(true, true)
    })
    console.log('  ✅ users table created')
  } else { console.log('  ⏭️  users (already exists)') }

  // Projects
  if (!(await db.schema.hasTable('projects'))) {
    await db.schema.createTable('projects', t => {
      t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'))
      t.string('name', 255).notNullable()
      t.text('description').nullable()
      t.string('location', 255).nullable()
      t.string('coordinates', 100).nullable()
      t.string('ecosystem', 50).defaultTo('mangrove')
      t.decimal('area_sq_km', 12, 4).nullable()
      t.decimal('ndvi_score', 5, 4).nullable()
      t.decimal('price_per_ton_usd', 10, 2).defaultTo(28.50)
      t.integer('available_credits').defaultTo(0)
      t.integer('issued_credits').defaultTo(0)
      t.integer('retired_credits').defaultTo(0)
      t.bigint('target_credits').defaultTo(10000)
      t.integer('token_id').nullable()
      t.integer('erc1155_token_id').nullable()
      t.string('validator_badge', 100).nullable()
      t.enu('status', ['pending','active','suspended','retired']).defaultTo('pending')
      t.string('methodology', 100).defaultTo('BEE_BM_FR05_001')
      t.string('standard', 100).nullable()
      t.string('external_serial', 100).nullable()
      t.string('metadata_uri', 512).nullable()
      t.string('image_url', 500).nullable()
      t.uuid('created_by').nullable()
      t.uuid('proposer_id').nullable()
      t.timestamps(true, true)
    })
    console.log('  ✅ projects table created')
  } else {
    await db.raw('ALTER TABLE projects ADD COLUMN IF NOT EXISTS proposer_id uuid REFERENCES users(id) ON DELETE SET NULL;')
    await db.raw('ALTER TABLE projects ADD COLUMN IF NOT EXISTS target_credits bigint DEFAULT 10000;')
    await db.raw('ALTER TABLE projects ADD COLUMN IF NOT EXISTS coordinates varchar(100);')
    await db.raw('ALTER TABLE projects ADD COLUMN IF NOT EXISTS metadata_uri varchar(512);')
    await db.raw('ALTER TABLE projects ADD COLUMN IF NOT EXISTS erc1155_token_id integer;')
    console.log('  ⏭️  projects (already exists, ensured columns)')
  }

  // Purchases
  if (!(await db.schema.hasTable('purchases'))) {
    await db.schema.createTable('purchases', t => {
      t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'))
      t.uuid('user_id').notNullable()
      t.uuid('project_id').notNullable()
      t.integer('amount_tons').notNullable()
      t.decimal('price_per_ton_usd', 10, 2).notNullable()
      t.decimal('total_usd', 12, 2).notNullable()
      t.string('stripe_payment_id', 255).nullable()
      t.string('tx_hash', 66).nullable()
      t.enu('status', ['pending','completed','failed','refunded']).defaultTo('pending')
      t.string('payment_method', 50).defaultTo('card')
      t.timestamps(true, true)
    })
    console.log('  ✅ purchases table created')
  } else { console.log('  ⏭️  purchases (already exists)') }

  // Retirements
  if (!(await db.schema.hasTable('retirements'))) {
    await db.schema.createTable('retirements', t => {
      t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'))
      t.uuid('user_id').nullable()
      t.uuid('project_id').notNullable()
      t.integer('token_id').notNullable()
      t.integer('amount').notNullable()
      t.text('note').nullable()
      t.string('retirement_id', 50).nullable()
      t.string('tx_hash', 66).nullable()
      t.timestamp('retired_at', { useTz: true }).defaultTo(db.fn.now())
      t.string('retiree_wallet', 42).nullable()
      t.text('retirement_note').nullable()
      t.bigint('block_number').nullable()
      t.string('certificate_id', 100).nullable()
      t.timestamps(true, true)
    })
    console.log('  ✅ retirements table created')
  } else {
    await db.raw('ALTER TABLE retirements ALTER COLUMN user_id DROP NOT NULL;')
    await db.raw('ALTER TABLE retirements ADD COLUMN IF NOT EXISTS retired_at timestamptz DEFAULT now();')
    await db.raw('ALTER TABLE retirements ADD COLUMN IF NOT EXISTS retiree_wallet varchar(42);')
    await db.raw('ALTER TABLE retirements ADD COLUMN IF NOT EXISTS retirement_note text;')
    await db.raw('ALTER TABLE retirements ADD COLUMN IF NOT EXISTS block_number bigint;')
    await db.raw('ALTER TABLE retirements ADD COLUMN IF NOT EXISTS certificate_id varchar(100);')
    console.log('  ⏭️  retirements (already exists, ensured columns)')
  }

  // Carbon Credits
  if (!(await db.schema.hasTable('carbon_credits'))) {
    await db.schema.createTable('carbon_credits', t => {
      t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'))
      t.uuid('project_id').references('id').inTable('projects').onDelete('CASCADE').nullable()
      t.uuid('owner_id').references('id').inTable('users').onDelete('SET NULL').nullable()
      t.string('owner_wallet', 42).nullable()
      t.integer('token_id').notNullable()
      t.bigint('amount').notNullable()
      t.string('status', 50).defaultTo('active')
      t.string('tx_hash', 66).nullable()
      t.timestamps(true, true)
    })
    console.log('  ✅ carbon_credits table created')
  } else { console.log('  ⏭️  carbon_credits (already exists)') }

  await db.raw('CREATE OR REPLACE VIEW mrv_logs AS SELECT * FROM mrv_runs;')

  // MRV Runs
  if (!(await db.schema.hasTable('mrv_runs'))) {
    await db.schema.createTable('mrv_runs', t => {
      t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'))
      t.uuid('project_id').notNullable()
      t.uuid('run_by').nullable()
      t.decimal('ndvi_score', 5, 4).nullable()
      t.enu('status', ['pending','verified','failed']).defaultTo('pending')
      t.text('log').nullable()
      t.jsonb('carbon_result').nullable()
      t.timestamps(true, true)
    })
    console.log('  ✅ mrv_runs table created')
  } else { console.log('  ⏭️  mrv_runs (already exists)') }

  // Password Reset Tokens
  if (!(await db.schema.hasTable('password_reset_tokens'))) {
    await db.schema.createTable('password_reset_tokens', t => {
      t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'))
      t.uuid('user_id').notNullable()
      t.string('token_hash', 64).notNullable().unique()
      t.boolean('used').defaultTo(false)
      t.timestamp('expires_at').notNullable()
      t.timestamps(true, true)
    })
    console.log('  ✅ password_reset_tokens table created')
  } else { console.log('  ⏭️  password_reset_tokens (already exists)') }

  // Newsletter
  if (!(await db.schema.hasTable('newsletter_subscribers'))) {
    await db.schema.createTable('newsletter_subscribers', t => {
      t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'))
      t.string('email', 320).notNullable().unique()
      t.boolean('active').defaultTo(true)
      t.timestamp('subscribed_at').defaultTo(db.fn.now())
      t.timestamps(true, true)
    })
    console.log('  ✅ newsletter_subscribers table created')
  } else { console.log('  ⏭️  newsletter_subscribers (already exists)') }

  // Contact
  if (!(await db.schema.hasTable('contact_submissions'))) {
    await db.schema.createTable('contact_submissions', t => {
      t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'))
      t.string('name', 200).notNullable()
      t.string('email', 320).notNullable()
      t.string('subject', 300).notNullable()
      t.text('message').notNullable()
      t.boolean('replied').defaultTo(false)
      t.timestamps(true, true)
    })
    console.log('  ✅ contact_submissions table created')
  } else { console.log('  ⏭️  contact_submissions (already exists)') }

  // Audit Logs
  if (!(await db.schema.hasTable('audit_logs'))) {
    await db.schema.createTable('audit_logs', t => {
      t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'))
      t.uuid('user_id').nullable()
      t.string('action', 200).notNullable()
      t.string('resource_type', 100).nullable()
      t.string('resource_id', 200).nullable()
      t.string('ip_address', 45).nullable()
      t.jsonb('meta').nullable()
      t.timestamp('created_at').defaultTo(db.fn.now())
    })
    console.log('  ✅ audit_logs table created')
  } else { console.log('  ⏭️  audit_logs (already exists)') }

  // Credit Serials
  if (!(await db.schema.hasTable('credit_serials'))) {
    await db.schema.createTable('credit_serials', t => {
      t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'))
      t.string('serial', 100).notNullable().unique()
      t.uuid('project_id').notNullable()
      t.integer('vintage_year').notNullable()
      t.enu('status', ['issued','available','reserved','transferred','retired','cancelled']).defaultTo('issued')
      t.uuid('current_holder_id').nullable()
      t.timestamps(true, true)
    })
    console.log('  ✅ credit_serials table created')
  } else { console.log('  ⏭️  credit_serials (already exists)') }

  // Grievances
  if (!(await db.schema.hasTable('grievances'))) {
    await db.schema.createTable('grievances', t => {
      t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'))
      t.string('reference_id', 50).notNullable().unique()
      t.uuid('project_id').nullable()
      t.enu('type', ['land_rights','community','environmental','data','fraud','double_counting','boundary','other']).notNullable()
      t.text('description').notNullable()
      t.text('evidence').nullable()
      t.string('contact_email', 320).nullable()
      t.boolean('anonymous').defaultTo(false)
      t.enu('status', ['open','in_progress','resolved','closed']).defaultTo('open')
      t.text('resolution').nullable()
      t.timestamps(true, true)
    })
    console.log('  ✅ grievances table created')
  } else { console.log('  ⏭️  grievances (already exists)') }

  // Verification Cases
  if (!(await db.schema.hasTable('verification_cases'))) {
    await db.schema.createTable('verification_cases', t => {
      t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'))
      t.uuid('project_id').notNullable()
      t.string('verifier_body', 255).nullable()
      t.decimal('creditable_tonnes', 12, 3).nullable()
      t.enu('status', ['pending_review','under_review','corrective_action','approved','rejected']).defaultTo('pending_review')
      t.text('findings').nullable()
      t.timestamps(true, true)
    })
    console.log('  ✅ verification_cases table created')
  } else { console.log('  ⏭️  verification_cases (already exists)') }

  // Permanence Events
  if (!(await db.schema.hasTable('permanence_events'))) {
    await db.schema.createTable('permanence_events', t => {
      t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'))
      t.uuid('project_id').notNullable()
      t.enu('event_type', ['MINOR_DECLINE','MODERATE_DECLINE','MAJOR_DECLINE','CATASTROPHIC','MONITORING_UPDATE']).notNullable()
      t.enu('severity', ['INFO','WARNING','HIGH','CRITICAL']).defaultTo('INFO')
      t.decimal('ndvi_before', 4, 3).nullable()
      t.decimal('ndvi_after', 4, 3).nullable()
      t.decimal('estimated_loss_co2e', 12, 3).nullable()
      t.text('description').nullable()
      t.enu('status', ['open','investigating','resolved','closed']).defaultTo('open')
      t.timestamps(true, true)
    })
    console.log('  ✅ permanence_events table created')
  } else { console.log('  ⏭️  permanence_events (already exists)') }

  // Carbon Calculations
  if (!(await db.schema.hasTable('carbon_calculations'))) {
    await db.schema.createTable('carbon_calculations', t => {
      t.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'))
      t.uuid('project_id').notNullable()
      t.string('methodology', 100).defaultTo('BEE_BM_FR05_001')
      t.decimal('gross_co2e', 12, 3).notNullable()
      t.decimal('net_co2e', 12, 3).notNullable()
      t.decimal('creditable_co2e', 12, 3).notNullable()
      t.decimal('confidence_score', 5, 2).nullable()
      t.jsonb('inputs').nullable()
      t.timestamps(true, true)
    })
    console.log('  ✅ carbon_calculations table created')
  } else { console.log('  ⏭️  carbon_calculations (already exists)') }

  // Seed 6 projects
  const count = await db('projects').count('id as c').first()
  if (parseInt(count.c) === 0) {
    const now = new Date()
    await db('projects').insert([
      { id: db.raw('gen_random_uuid()'), name:'Sundarbans Mangrove Reserve', description:'UNESCO-listed mangrove delta restoration in West Bengal', location:'West Bengal, India', ecosystem:'mangrove', area_sq_km:4262, ndvi_score:0.84, price_per_ton_usd:28.50, available_credits:8200, issued_credits:8240, retired_credits:1240, token_id:1001, validator_badge:'Verra', status:'active', methodology:'BEE_BM_FR05_001', standard:'India CCTS + Verra VCS', external_serial:'VCS-9234-2025-MNGRV-IN-SDB', created_at:now, updated_at:now },
      { id: db.raw('gen_random_uuid()'), name:'Bhitarkanika Coastal Forest', description:'Mangrove restoration in Odisha coastal forest region', location:'Odisha, India', ecosystem:'mangrove', area_sq_km:672, ndvi_score:0.76, price_per_ton_usd:24.80, available_credits:5100, issued_credits:5100, retired_credits:420, token_id:1002, validator_badge:'CCTS', status:'active', methodology:'BEE_BM_FR05_001', standard:'India CCTS', created_at:now, updated_at:now },
      { id: db.raw('gen_random_uuid()'), name:'Pichavaram Mangrove Block', description:'Mangrove rehabilitation in Tamil Nadu coastal wetlands', location:'Tamil Nadu, India', ecosystem:'mangrove', area_sq_km:42, ndvi_score:0.71, price_per_ton_usd:22.00, available_credits:3400, issued_credits:3400, retired_credits:0, token_id:1003, validator_badge:'Gold Standard', status:'active', methodology:'BEE_BM_FR05_001', standard:'India CCTS', created_at:now, updated_at:now },
      { id: db.raw('gen_random_uuid()'), name:'Godavari Delta Reserve', description:'Large-scale mangrove afforestation in Andhra Pradesh delta', location:'Andhra Pradesh, India', ecosystem:'mangrove', area_sq_km:726, ndvi_score:0.79, price_per_ton_usd:26.50, available_credits:6700, issued_credits:6700, retired_credits:0, token_id:1004, validator_badge:'Verra', status:'active', methodology:'BEE_BM_FR05_001', standard:'India CCTS + Verra VCS', created_at:now, updated_at:now },
      { id: db.raw('gen_random_uuid()'), name:'Chilika Lagoon Seagrass', description:'Seagrass meadow restoration in Chilika Lake — largest coastal lagoon in India', location:'Odisha, India', ecosystem:'seagrass', area_sq_km:156, ndvi_score:0.68, price_per_ton_usd:31.00, available_credits:2100, issued_credits:2100, retired_credits:0, token_id:1005, validator_badge:'Verra', status:'active', methodology:'VCS_VM0033', standard:'Verra VCS', created_at:now, updated_at:now },
      { id: db.raw('gen_random_uuid()'), name:'Andaman Pristine Mangrove', description:'Conservation of pristine mangrove forests in Andaman Islands', location:'Andaman & Nicobar Islands, India', ecosystem:'mangrove', area_sq_km:1190, ndvi_score:0.89, price_per_ton_usd:34.00, available_credits:9400, issued_credits:9400, retired_credits:0, token_id:1006, validator_badge:'Isometric', status:'active', methodology:'ISOMETRIC_MANGROVE_V1', standard:'ICVCM CCP-Approved', created_at:now, updated_at:now },
    ])
    console.log('  ✅ 6 sample projects seeded')
  } else {
    console.log(`  ⏭️  projects already seeded (${count.c} found)`)
  }

  console.log('\n🎉 Migration complete! Run: npm run dev\n')
}

up()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\n❌ Migration failed:', err.message)
    console.error('Tip: Run: docker start carbonx_postgres')
    process.exit(1)
  })

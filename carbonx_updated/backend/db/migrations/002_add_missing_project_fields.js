exports.up = async function (knex) {
  await knex.schema.alterTable('projects', (t) => {
    t.bigint('retired_credits').defaultTo(0)
    t.integer('token_id').nullable()
  })

  await knex.raw(`ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_status_check"`)
  await knex.raw(`ALTER TABLE "projects" ADD CONSTRAINT "projects_status_check" CHECK ("status" IN ('proposed','pending_mrv','verified','rejected','active','upcoming','soldout'))`)
}

exports.down = async function (knex) {
  await knex.raw(`ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_status_check"`)
  await knex.raw(`ALTER TABLE "projects" ADD CONSTRAINT "projects_status_check" CHECK ("status" IN ('proposed','pending_mrv','verified','rejected','active'))`)
  await knex.schema.alterTable('projects', (t) => {
    t.dropColumn('retired_credits')
    t.dropColumn('token_id')
  })
}

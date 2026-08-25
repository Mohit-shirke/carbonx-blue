require('dotenv').config();
const path = require('path');

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host:     process.env.DB_HOST || '127.0.0.1',
      port:     process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'carbonx_db',
      user:     process.env.DB_USER || 'carbonx',
      password: process.env.DB_PASSWORD || 'password',
    },
    pool: {
      min: 2,
      max: 10
    },
    // Use connection object for local, avoid global SSL config
    migrations: {
      tableName: 'knex_migrations',
      directory: path.resolve(__dirname, 'db/migrations'),
    },
    seeds: {
      directory: path.resolve(__dirname, 'db/seeds'),
    },
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      tableName: 'knex_migrations',
      directory: path.resolve(__dirname, 'db/migrations'),
    },
  },
};
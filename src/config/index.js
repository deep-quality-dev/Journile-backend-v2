/* @flow */

import dotenv from 'dotenv';

dotenv.config()

export default {
  hostname: process.env.HOST || 'localhsot',
  port: parseInt(process.env.PORT) || 4000,

  db_host: process.env.DB_HOST,
  db_post: process.env.DB_PORT,
  db_name: process.env.DB_NAME,
  db_user: process.env.DB_USER,
  db_pass: process.env.DB_PASS,
  db_dialect: process.env.DB_DIALECT,

  ssl: process.env.ENVIRONMENT == "production"? process.env.SSL : false,
}
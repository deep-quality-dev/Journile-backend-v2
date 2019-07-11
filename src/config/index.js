/* @flow */

import dotenv from 'dotenv';

dotenv.config()

export default {
  hostname: process.env.HOST || 'localhsot',
  port: parseInt(process.env.PORT) || 4000,

  db_host: process.env.DB_HOST,
  db_port: process.env.DB_PORT,
  db_name: process.env.DB_NAME,
  db_user: process.env.DB_USER,
  db_pass: process.env.DB_PASS,
  db_dialect: process.env.DB_DIALECT,
  
  redis_host: process.env.REDIS_HOST,
  redis_port: process.env.REDIS_PORT,
  redis_pass: process.env.REDIS_PASS,

  ssl: process.env.ENVIRONMENT == "production"? process.env.SSL : false,

  secret_key: process.env.SECRET_KEY,
  token_expiresin: process.env.TOKEN_EXPIRESIN,
  refresh_token_expiresin: process.env.REFRESH_TOKEN_EXPIRESIN,
}
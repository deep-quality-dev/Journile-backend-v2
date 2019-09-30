/* @flow */

import dotenv from 'dotenv';

dotenv.config()

export default {
  env_mode: process.env.ENVIRONMENT,

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
  
  aws_accesskey: process.env.AWS_ACCESSKEYID || '',
  aws_secretkey: process.env.AWS_SECRETKEY || '',
  aws_s3_bucket: process.env.AWS_S3_BUCKETNAME || '',
  aws_smtp_region: process.env.AWS_SMTP_REGION || '',

  server_root_url: process.env.SERVER_ROOT_URL || '',
  web_root_url: process.env.WEB_ROOT_URL || '',

  ssl: process.env.ENVIRONMENT == 'production'? process.env.SSL : false,

  activation_code_digit: parseInt(process.env.ACTIVATION_CODE_DIGIT) || 6,
  activation_code_expiresin: parseInt(process.env.ACTIVATION_CODE_EXPIRESIN) || 86400,
  activation_link_url: process.env.ACTIVATION_LINK_URL || 'activate',

  secret_key: process.env.SECRET_KEY,
  token_expiresin: process.env.TOKEN_EXPIRESIN || '30m',
  refresh_token_expiresin: process.env.REFRESH_TOKEN_EXPIRESIN || '12h',

  mail_sender_name: process.env.MAIL_SENDER_NAME || '',
  mail_sender_email: process.env.MAIL_SENDER_EMAIL || '',
  mail_sender_email_pass: process.env.MAIL_SENDER_EMAIL_PASS || '',
  confirm_mail_subject: process.env.CONFIRM_MAIL_SUBJECT || 'PLEASE CONFIRM YOUR EMAIL',

  company_name: process.env.COMPANY_NAME || '',
  company_address: process.env.COMPANY_ADDRESS || '',
  company_phonenumber: process.env.COMPANY_PHONENUMBER || '',

  scraper_secret_key: process.env.SCRAPER_SECRET_KEY,
  scraper_token_expiresin: process.env.SCRAPER_TOKEN_EXPIRESIN || '30m',

  weather_api_key: process.env.WEATHER_API_KEY || '',
}
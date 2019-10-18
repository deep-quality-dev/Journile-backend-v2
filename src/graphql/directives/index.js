/* @flow */

import { schema as authSchema, IsAuthDirective, CheckAuthDirective } from './auth';
import { schema as scraperAuthSchema, IsScraperAuthDirective } from './scraper'
import { schema as urlSchema, URLDirective } from './url'

export const schemas = [
  authSchema,
  scraperAuthSchema,
  urlSchema,
]

export default {
  isAuth: IsAuthDirective,
  checkAuth: CheckAuthDirective,
  isScraperAuth: IsScraperAuthDirective,
  URL: URLDirective,
}
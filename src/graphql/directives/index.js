/* @flow */

import { schema as authSchema, IsAuthDirective } from './auth';
import { schema as scraperAuthSchema, IsScraperAuthDirective } from './scraper'

export const schemas = [
  authSchema,
  scraperAuthSchema,
]

export default {
  isAuth: IsAuthDirective,
  isScraperAuth: IsScraperAuthDirective,
}
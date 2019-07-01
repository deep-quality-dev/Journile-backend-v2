/* @flow */

import { schema as authSchema, IsAuthDirective } from './auth';

export const schemas = [
  authSchema,
]

export default {
  isAuth: IsAuthDirective
}
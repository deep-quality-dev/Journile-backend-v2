/* @flow */

import { gql, SchemaDirectiveVisitor, AuthenticationError, UserInputError } from 'apollo-server-express';
import { defaultFieldResolver } from 'graphql';

import config from '../../config';

export const schema = gql`
  directive @URL on FIELD_DEFINITION
`;

export class URLDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: any) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function (...args) {
      let result = await resolve.apply(this, args);
      if (!result) return result;

      if (typeof result === 'string') {
        if (result.indexOf('http') !== 0) {
          result = config.server_root_url + result;
        }
      } else if (Array.isArray(result)) {
        result = result.map(url => url.indexOf('http') === 0? url: config.server_root_url + url);
      }
      return result;
    };
  }
}
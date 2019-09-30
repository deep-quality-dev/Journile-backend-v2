/* @flow */

import { gql, SchemaDirectiveVisitor, AuthenticationError, UserInputError } from 'apollo-server-express';
import { defaultFieldResolver } from 'graphql';
import jwt from 'jsonwebtoken';

import config from '../../config';

export const schema = gql`
  directive @isAuth on FIELD_DEFINITION
  directive @checkAuth on FIELD_DEFINITION
`;

const verifyPromise = (token: string) => new Promise((resolve, reject) => {
  try {
    let decoded:any = jwt.verify(token, config.secret_key);
    resolve(decoded);
  } 
  catch(err) {
    reject(err);
  }
});

function checkAuth(authorization: string) {
  let token: ?string = null;

  var parts = authorization.split(' ');
  if (parts.length == 1) {
    token = authorization;
  } else if (parts.length == 2) {
    var scheme = parts[0];
    var credentials = parts[1];

    if (/^Bearer$/i.test(scheme)) {
      token = credentials;
    }
  }

  if (token) {
    return verifyPromise(token)
  } else {
    return new Promise((resolve, rejects) => {
      rejects(new UserInputError('Format is Authorization: Bearer [token]'));
    })
  }
}

export class IsAuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: any) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function (...args) {
      const [ , params, context ] = args;
      const { authorization } = context;
      if (authorization) {
        const decoded = await checkAuth(authorization);
        context.user = decoded;
        const result = await resolve.apply(this, args);
        return result;
      } else {
        throw new AuthenticationError('You must be the authenticated user to get this information');
      }
    };
  }
}

export class CheckAuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: any) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function (...args) {
      const [ , params, context ] = args;
      const { authorization } = context;
      if (authorization) {
        try {
          const decoded = await checkAuth(authorization);
          context.user = decoded;
        } catch(err) {
          // nothing need to handle
        }
      }
      const result = await resolve.apply(this, args);
      return result;
    };
  }
}
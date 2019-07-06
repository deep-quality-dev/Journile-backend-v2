/* @flow */

import { gql } from 'apollo-server-express';

import { schemas as directiveSchemas } from '../directives';

import categorySchema from './category';
import channelSchema from './channel';
import countrySchema from './country';
import gammatagSchema from './gammatag';
import postSchema from './post';
import userSchema from './user';

const linkSchema = gql`
  scalar Date

  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
`;

export default [
  ...directiveSchemas,
  linkSchema,
  categorySchema,
  channelSchema,
  countrySchema,
  gammatagSchema,
  postSchema,
  userSchema,
];
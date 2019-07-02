/* @flow */

import { gql } from 'apollo-server-express';

import { schemas as directiveSchemas } from '../directives';
import userSchema from './user';
import postSchema from './post';

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
  userSchema,
  postSchema,
];
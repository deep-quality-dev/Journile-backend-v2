/* @flow */

import { GraphQLDateTime } from 'graphql-iso-date';

import userResolvers from './user';
import postResolvers from './post';

const customScalarResolver = {
  Date: GraphQLDateTime,
};

export default [
  customScalarResolver,
  userResolvers,
  postResolvers,
];
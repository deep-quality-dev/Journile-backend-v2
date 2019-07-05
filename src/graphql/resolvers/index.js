/* @flow */

import { GraphQLDateTime } from 'graphql-iso-date';

import categoryResolvers from './category';
import postResolvers from './post';
import userResolvers from './user';

const customScalarResolver = {
  Date: GraphQLDateTime,
};

export default [
  customScalarResolver,
  categoryResolvers,
  postResolvers,
  userResolvers,
];
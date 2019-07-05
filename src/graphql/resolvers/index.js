/* @flow */

import { GraphQLDateTime } from 'graphql-iso-date';

import categoryResolvers from './category';
import channelResolvers from './channel';
import postResolvers from './post';
import userResolvers from './user';

const customScalarResolver = {
  Date: GraphQLDateTime,
};

export default [
  customScalarResolver,
  categoryResolvers,
  channelResolvers,
  postResolvers,
  userResolvers,
];
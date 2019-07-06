/* @flow */

import { GraphQLDateTime } from 'graphql-iso-date';

import categoryResolvers from './category';
import channelResolvers from './channel';
import gammatagResolvers from './gammatag';
import postResolvers from './post';
import userResolvers from './user';

const customScalarResolver = {
  Date: GraphQLDateTime,
};

export default [
  customScalarResolver,
  categoryResolvers,
  channelResolvers,
  gammatagResolvers,
  postResolvers,
  userResolvers,
];
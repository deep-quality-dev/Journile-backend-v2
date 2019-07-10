/* @flow */

import { GraphQLDateTime } from 'graphql-iso-date';
import GraphQLLocation from '../types/location';

import categoryResolvers from './category';
import channelResolvers from './channel';
import cityResolvers from './city';
import countryResolvers from './country';
import gammatagResolvers from './gammatag';
import languageResolvers from './language';
import postResolvers from './post';
import userResolvers from './user';
import userSettingResolvers from './user_setting';

const customScalarResolver = {
  Date: GraphQLDateTime,
  Location: GraphQLLocation
};

export default [
  customScalarResolver,
  categoryResolvers,
  channelResolvers,
  cityResolvers,
  countryResolvers,
  gammatagResolvers,
  languageResolvers,
  postResolvers,
  userResolvers,
  userSettingResolvers,
];
/* @flow */

import { GraphQLDateTime } from 'graphql-iso-date';
import GraphQLLocation from '../types/location';

import categoryResolvers from './category';
import channelResolvers from './channel';
import cityResolvers from './city';
import contactResolvers from './contact';
import countryResolvers from './country';
import gammatagResolvers from './gammatag';
import languageResolvers from './language';
import postCommentResolvers from './post_comment';
import postRateResolvers from './post_rate';
import postResolvers from './post';
import userResolvers from './user';
import readResolvers from './read';
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
  contactResolvers,
  countryResolvers,
  gammatagResolvers,
  languageResolvers,
  postCommentResolvers,
  postRateResolvers,
  postResolvers,
  readResolvers,
  userResolvers,
  userSettingResolvers,
];
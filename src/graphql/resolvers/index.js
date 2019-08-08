/* @flow */

import { GraphQLDateTime } from 'graphql-iso-date';
import GraphQLLocation from '../types/location';

import bookmarkResolvers from './bookmark';
import categoryResolvers from './category';
import channelResolvers from './channel';
import cityResolvers from './city';
import contactResolvers from './contact';
import countryResolvers from './country';
import gammatagResolvers from './gammatag';
import languageResolvers from './language';
import postCommentResolvers from './post_comment';
import postHiddenResolvers from './post_hidden';
import postRateResolvers from './post_rate';
import postReportResolvers from './post_report';
import postResolvers from './post';
import userResolvers from './user';
import readResolvers from './read';
import userSettingResolvers from './user_setting';
import uploadResolvers from './upload';

const customScalarResolver = {
  Date: GraphQLDateTime,
  Location: GraphQLLocation
};

export default [
  bookmarkResolvers,
  customScalarResolver,
  categoryResolvers,
  channelResolvers,
  cityResolvers,
  contactResolvers,
  countryResolvers,
  gammatagResolvers,
  languageResolvers,
  postCommentResolvers,
  postHiddenResolvers,
  postRateResolvers,
  postReportResolvers,
  postResolvers,
  readResolvers,
  userResolvers,
  userSettingResolvers,
  uploadResolvers,
];
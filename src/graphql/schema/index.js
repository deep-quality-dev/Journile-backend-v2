/* @flow */

import { gql } from 'apollo-server-express';

import { schemas as directiveSchemas } from '../directives';

import bookmarkSchema from './bookmark';
import categorySchema from './category';
import channelSchema from './channel';
import citySchema from './city';
import contactSchema from './contact';
import countrySchema from './country';
import gammatagSchema from './gammatag';
import languageSchema from './language';
import postCommentSchema from './post_comment';
import postHiddenSchema from './post_hidden';
import postRateSchema from './post_rate';
import postReportSchema from './post_report';
import postSchema from './post';
import readSchema from './read';
import userSchema from './user';
import userSettingSchema from './user_setting';
import uploadSchema from './upload';

const linkSchema = gql`
  scalar Date
  scalar Location

  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
`;

export default [
  ...directiveSchemas,
  bookmarkSchema,
  linkSchema,
  categorySchema,
  channelSchema,
  citySchema,
  contactSchema,
  countrySchema,
  gammatagSchema,
  languageSchema,
  postCommentSchema,
  postHiddenSchema,
  postRateSchema,
  postReportSchema,
  postSchema,
  readSchema,
  userSchema,
  userSettingSchema,
  uploadSchema,
];
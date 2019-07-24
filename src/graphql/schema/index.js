/* @flow */

import { gql } from 'apollo-server-express';

import { schemas as directiveSchemas } from '../directives';

import categorySchema from './category';
import channelSchema from './channel';
import citySchema from './city';
import contactSchema from './contact';
import countrySchema from './country';
import gammatagSchema from './gammatag';
import languageSchema from './language';
import postRateSchema from './post_rate';
import postSchema from './post';
import readSchema from './read';
import userSchema from './user';
import userSettingSchema from './user_setting';

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
  linkSchema,
  categorySchema,
  channelSchema,
  citySchema,
  contactSchema,
  countrySchema,
  gammatagSchema,
  languageSchema,
  postRateSchema,
  postSchema,
  readSchema,
  userSchema,
  userSettingSchema,
];
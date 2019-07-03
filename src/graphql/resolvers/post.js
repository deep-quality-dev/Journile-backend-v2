/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';

import config from '../../config';
import models from '../../models';

export default {
  Query: {
    getPosts: async (parent, {date, isLater},) => {
      return await models.post.findPublicPosts(date, isLater);
    },
  },

  Mutation: {
  },
};
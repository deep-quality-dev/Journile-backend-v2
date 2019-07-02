/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';

import config from '../../config';
import models from '../../models';

export default {
  Query: {
    getPosts: async (parent, {date, isLater},) => {
      console.log('date', date)
      console.log('isLater', isLater)

      return await models.Post.findPublicPosts(date, isLater);
    },
  },

  Mutation: {
  },
};
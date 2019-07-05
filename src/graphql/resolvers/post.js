/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';

import config from '../../config';
import models from '../../models';

export default {
  Query: {
    getPosts: async (parent: any, params: any) => {
      const { date, isLater } = params
      return await models.Post.findPublicPosts(date, isLater);
    },
  },

  Mutation: {
  },
};
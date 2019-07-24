/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';

import models from '../../models';

function getQueryOption(info: any) {
  const option = {
    include: [
      { model: models.Category, as: 'category' },
      { model: models.Channel, as: 'channel' },
      { model: models.User, as: 'author' },
    ],
  }

  return option
}

export default {
  Query: {
    getPublicPosts: async (parent: any, params: any, context: any, info: any) => {
      const { date, isLater } = params
      const option = getQueryOption(info)

      // return await models.Post.findPublicPosts(date, isLater, option);
      return await models.Post.findAll({ ...option, order: [['original_post_date', 'DESC']], limit: 20 });
    },
  },

  // Mutation: {
  // },
};
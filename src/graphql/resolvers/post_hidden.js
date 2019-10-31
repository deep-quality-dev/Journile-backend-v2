/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { fieldsList } from 'graphql-fields-list';
import Joi from '@hapi/joi';

import models from '../../models';

function getQueryOption(info: any) {
  const fields = fieldsList(info);
  const option = {
    include: [
      { model: models.Post, as: 'post' },
    ],
  }
  if (fields.includes('user')) {
    option['include'].push ({ model: models.User, as: 'user' })
  }

  return option
}

export default {
  Query: {
    getPostHiddens: async (parent: any, params: any, context: any, info: any) => {
      const option = getQueryOption(info)

      return await models.PostHidden.findAll({ ...option });
    },

    getPostHidden: async (parent: any, params: any, context: any, info: any) => {
      const { id } = params
      const option = getQueryOption(info)

      return await models.PostHidden.findByPk(id, { ...option });
    },
  },

  Mutation: {
    hidePost: async (parent: any, params: any, context: any) => {
      const { input: { post_id, reason } } = params
      const { user } = context
      if (!user) {
        return false;
      }

      const schema = Joi.object().keys({
        post_id: Joi.string().regex(/^[\d]{1,20}$/).required(),
        reason: Joi.string().required(),
      });

      try {
        Joi.assert({ post_id, reason }, schema);
      } catch (err) { throw new UserInputError(err.details[0].message) }

      const post = await models.Post.findByPk(post_id);
      if (!post) {
        throw new UserInputError(`Post with id - ${post_id} isn't exist`)
      }

      let postHidden = await models.PostHidden.create({
        post_id,
        user_id: user.id,
        reason,
      })

      return !!postHidden
    },
  },
};
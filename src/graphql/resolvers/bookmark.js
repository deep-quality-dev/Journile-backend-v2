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
    getBookmarks: async (parent: any, params: any, context: any, info: any) => {
      const option = getQueryOption(info)

      return await models.Bookmark.findAll({ ...option });
    },

    getBookmark: async (parent: any, params: any, context: any, info: any) => {
      const { id } = params
      const option = getQueryOption(info)

      return await models.Bookmark.findByPk(id, { ...option });
    },
  },

  Mutation: {
    bookmarkPost: async (parent: any, params: any, context: any) => {
      const { input: { post_id, enable } } = params
      const { user } = context
      if (!user) {
        return false;
      }

      const schema = Joi.object().keys({
        post_id: Joi.string().regex(/^[\d]{1,20}$/).required(),
      });

      try {
        Joi.assert({ post_id }, schema);
      } catch (err) { throw new UserInputError(err.details[0].message) }

      const post = await models.Post.findByPk(post_id);
      if (!post) {
        throw new UserInputError(`Post with id - ${post_id} isn't exist`)
      }

      const bookmarkStatus = enable? 1: 0;
      let bookmark = await models.Bookmark.findOne({ where: { post_id, user_id: user.id } });
      if (bookmark) {
        if (bookmark.status != bookmarkStatus)
          await models.Bookmark.update({ status: bookmarkStatus }, { where: { id: bookmark.id } })
        return true
      } else {
        bookmark = await models.Bookmark.create({
          post_id,
          user_id: user.id,
          status: bookmarkStatus,
        })

        return !!bookmark
      }
    },
  },
};
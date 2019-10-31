/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { fieldsList } from 'graphql-fields-list';
import Joi from '@hapi/joi';

import models from '../../models';
import graph from '../../middleware/graph';

function getQueryOption(info: any) {
  const fields = fieldsList(info);
  const option = {
    include: [
      { model: models.User, as: 'user' },
    ],
  }
  if (fields.includes('post')) {
    option['include'].push ({ model: models.Post, as: 'post' })
  }

  return option
}

export default {
  Query: {
    getPostComments: async (parent: any, params: any, context: any, info: any) => {
      const { post_id } = params
      const option = getQueryOption(info)

      return await models.PostComment.findAll({ where: { post_id }, ...option });
    },
  },

  Mutation: {
    addPostComment: async (parent: any, params: any, context: any) => {
      const { input: { post_id, content, reply_id } } = params
      const { user } = context
      if (!user) {
        return false;
      }

      const schema = Joi.object().keys({
        post_id: Joi.string().regex(/^[\d]{1,20}$/).required(),
        content: Joi.string().required(),
        reply_id: Joi.string().regex(/^[\d]{1,20}$/),
      });

      try {
        Joi.assert({ post_id, content, reply_id }, schema);
      } catch (err) { throw new UserInputError(err.details[0].message) }

      const post = await models.Post.findByPk(post_id);
      if (!post) {
        throw new UserInputError(`Post with id - ${post_id} isn't exist`)
      }

      let postComment;
      if (reply_id) {
        postComment = await models.PostComment.findByPk(reply_id);
        if (!postComment || postComment.post_id != post_id) {
          throw new UserInputError(`Comment with id - ${reply_id} isn't match to post with id - ${post_id}`)
        }
        if (postComment && postComment.user_id == user.id) {
          throw new UserInputError(`Cannot reply to your old comments`)
        }
      }

      postComment = await models.PostComment.create({
        post_id,
        user_id: user.id,
        content,
        reply_id,
      })
      graph.ratePost(postComment.get({ plain: true }));

      return !!postComment
    },
  },
};
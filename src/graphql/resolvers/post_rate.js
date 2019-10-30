/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import Joi from '@hapi/joi';

import models from '../../models';
import graph from '../../middleware/graph';

export default {
  Mutation: {
    ratePost: async (parent: any, params: any, context: any) => {
      const { input: { post_id, rate } } = params
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
      } else if (post.author_id == user.id) {
        throw new UserInputError(`Can't rate your own post`)
      }

      let postRate = await models.PostRate.upsert({ post_id, user_id: user.id, status: rate }, { where: { post_id, user_id: user.id } });
      if (postRate) {
        graph.ratePost(postRate.get({ plain: true }));
        return true
      } else {
        return false
      }
    },
  },
};
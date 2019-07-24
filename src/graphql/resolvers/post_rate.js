/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import Joi from '@hapi/joi';

import models from '../../models';

export default {
  Mutation: {
    ratePost: async (parent: any, params: any, context: any) => {
      const { input: { post_id, rate } } = params
      const userRate = rate? 1: 2
      const { user } = context
      if (!user) {
        return false;
      }

      const schema = Joi.object().keys({
        post_id: Joi.string().regex(/^[\d]{1,20}$/),
      });

      try {
        Joi.assert({ post_id }, schema);
      } catch (err) { throw new UserInputError(err.details[0].message) }

      const post = await models.Post.findByPk(post_id);
      if (!post) {
        throw new UserInputError(`Post with id - ${post_id} isn't exist`)
      }

      let postRate = await models.PostRate.findOne({ where: { post_id, user_id: user.id } });
      if (postRate) {
        if (postRate.status != userRate)
          await models.PostRate.update({ status: userRate }, { where: { id: postRate.id } })
        return true
      } else {
        postRate = await models.PostRate.create({
          post_id,
          user_id: user.id,
          status: userRate,
        })

        return !!postRate
      }
    },
  },
};
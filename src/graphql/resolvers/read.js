/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';

import models from '../../models';

export default {
  Query: {
    getUserReads: async (parent: any, args: any, context: any, info: any) => {
      const { user_id } = args

      return await models.Read.getUserReads(user_id);
    },
  },

  Mutation: {
    readUser: async (parent: any, params: any, context: any) => {
      let { user_id, read } = params
      read = read || true;
      const { user } = context

      if (user.id == user_id) {
        throw new UserInputError('Cannot read self.')
      }

      const readingUser = await models.User.findByPk(user_id, { where: { status: 1 } })

      if (!readingUser) {
        throw new UserInputError('User not exist.')
      }

      await models.Read.upsert({user_id: user.id, reading_id: user_id, type: 0, status: read? 1: 0}, { where: {user_id: user.id, reading_id: user_id, type: 0 } })

      return true;
    }
  }
};
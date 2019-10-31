/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { fieldsList } from 'graphql-fields-list';

import models from '../../models';

function getQueryOption(info: any) {
  const fields = fieldsList(info);
  const option = {
    include: [
      { model: models.User, as: 'block' },
    ],
    where: { status: 1 }
  }
  if (fields.includes('user')) {
    option['include'].push ({ model: models.User, as: 'user' })
  }

  return option
}

export default {
  Query: {
    getUserBlocks: async (parent: any, params: any, context: any, info: any) => {
      const option = getQueryOption(info)

      return await models.UserBlock.findAll(option);
    },
    
    getBlockedUsers: async (parent: any, params: any, context: any, info: any) => {
      const { user } = context
      if (!user) {
        throw new AuthenticationError('Can\'t get user info');
      }

      const option = getQueryOption(info)
      option.where = { user_id: user.id, status: 1 }

      return await models.UserBlock.findAll(option);
    },
  },

  Mutation: {
    blockUser: async (parent: any, params: any, context: any) => {
      const { input: { block_id } } = params
      const { user } = context
      if (!user) {
        return false;
      }

      if (block_id == user.id) {
        throw new UserInputError(`Can't block yourself.`)
      }

      const blockedUser = await models.User.findByPk(block_id);
      if (!blockedUser) {
        throw new UserInputError(`User with id - ${block_id} isn't exist`)
      }

      let userBlock = await models.UserBlock.upsert({ user_id: user.id, block_id, status: 1, }, { where: { user_id: user.id, block_id, }})

      return !!userBlock
    },
    
    unblockUser: async (parent: any, params: any, context: any) => {
      const { input: { block_id } } = params
      const { user } = context
      if (!user) {
        return false;
      }

      if (block_id == user.id) {
        throw new UserInputError(`Can't block yourself.`)
      }

      const blockedUser = await models.User.findByPk(block_id);
      if (!blockedUser) {
        throw new UserInputError(`User with id - ${block_id} isn't exist`)
      }

      let userBlock = await models.UserBlock.upsert({ user_id: user.id, block_id, status: 0, }, { where: { user_id: user.id, block_id, }})

      return !!userBlock
    },
  },
};
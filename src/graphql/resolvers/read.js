/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';

import models from '../../models';
import graph from '../../middleware/graph';

export default {
  Query: {
    getUserReads: async (parent: any, params: any, context: any, info: any) => {
      const { user_id } = params

      return await models.Read.getUserReads(user_id);
    },

    isReadingUser: async (parent: any, params: any, context: any ) => {
      const { user_id } = params
      const { user } = context

      const read = await models.Read.findOne({ where: { user_id: user.id, reading_id: user_id, type: 0 } });

      return read? read.status: 0;
    },

    isReadingChannel: async (parent: any, params: any, context: any ) => {
      const { channel_id } = params
      const { user } = context

      const read = await models.Read.findOne({ where: { user_id: user.id, reading_id: channel_id, type: 1 } });

      return read? read.status: 0;
    },
  },

  Mutation: {
    readUser: async (parent: any, params: any, context: any) => {
      let { user_id, reading } = params
      const { user } = context

      if (user.id == user_id) {
        throw new UserInputError('Cannot read self.')
      }

      const readingUser = await models.User.findByPk(user_id, { where: { status: 1 } })

      if (!readingUser) {
        throw new UserInputError('User not exist.')
      }

      const read = await models.Read.upsert({user_id: user.id, reading_id: user_id, type: 0, status: reading}, { where: {user_id: user.id, reading_id: user_id, type: 0 } })
      graph.readUser(read.get({ plain: true }));

      return true;
    },
    
    readChannel: async (parent: any, params: any, context: any) => {
      let { channel_id, reading } = params
      const { user } = context

      const channel = await models.Channel.findByPk(channel_id, { where: { status: 0 } })

      if (!channel) {
        throw new UserInputError('Channel not exist.')
      }

      const read = await models.Read.upsert({user_id: user.id, reading_id: channel_id, type: 1, status: reading}, { where: {user_id: user.id, reading_id: channel_id, type: 1 } })
      graph.readChannel(read.get({ plain: true }));

      return true;
    }
  }
};
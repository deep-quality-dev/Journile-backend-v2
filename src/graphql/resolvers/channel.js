/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';

import models from '../../models';

export default {
  Query: {
    getChannels: async (parent: any, args: any ) => {
      return await models.Channel.findAll();
    },

    getChannel: async (parent: any, args: any ) => {
      const { id } = args
      return await models.Channel.findByPk(id);
    },
  },
};
/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { fieldsList } from 'graphql-fields-list';

import models from '../../models';

function getQueryOption(info: any) {
  const fields = fieldsList(info);
  const option = {}
  if (fields.includes('country')) {
    option['include'] = { model: models.Country, as: 'country' }
  }

  return option
}

export default {
  Query: {
    getChannels: async (parent: any, args: any, context: any, info: any) => {
      const option = getQueryOption(info)

      return await models.Channel.findAll({ ...option });
    },
    
    getHotChannels: async (parent: any, args: any, context: any, info: any) => {
      const { count } = args
      const limit = count || 10;

      return await models.Channel.getHotChannels(limit);
    },

    getChannel: async (parent: any, args: any, context: any, info: any) => {
      const { id } = args
      const option = getQueryOption(info)

      return await models.Channel.findByPk(id, { ...option });
    },
  },
};
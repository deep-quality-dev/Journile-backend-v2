/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import Sequelize from 'sequelize';
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

      const option = {
        subQuery: false,
        nest: true,
        raw: true,
        attributes: {
          include: [
            [ Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col("reader.id"))), 'readers' ],
          ]
        },
        include: [
          { model: models.Country, as: 'country' },
          { model: models.Read, as: 'reader', attributes: [], required: false, where: { type: 1, status: 1 } },
        ],
        group: [ 'channel.id', 'country.id' ],
        limit: count,
        order: [ [Sequelize.literal('readers'), 'DESC'], ],
      }

      return await models.Channel.findAll(option);
    },

    getChannel: async (parent: any, args: any, context: any, info: any) => {
      const { id } = args
      const option = getQueryOption(info)

      return await models.Channel.findByPk(id, { ...option });
    },

    getChannelByUsername: async (parent: any, params: any, context: any ) => {
      const { username } = params
      const { user } = context

      const option = {
        subQuery: false,
        nest: true,
        raw: true,
        attributes: {
          include: [
            [ user? Sequelize.fn('COALESCE', Sequelize.fn('MAX', Sequelize.col('myRead.status')), 0): Sequelize.literal(0), 'reading' ],
          ]
        },
        group: [ 'channel.id', 'country.id' ],
        include: [{ model: models.Country, as: 'country' }],
        where: { username },
      }

      if (user) {
        option.include.push({ model: models.Read, as: 'myRead', attributes: [], required: false, where: { user_id: user.id, type: 1 } });
      }

      return await models.Channel.findOne(option);
    },
  },
};
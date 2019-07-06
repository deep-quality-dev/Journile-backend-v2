/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';

import models from '../../models';

export default {
  Query: {
    getTrendingGammatags: async (parent: any, args: any ) => {
      const { count } = args
      const limit = count || 10;

      return await models.Gammatag.findAll({ order: [['rate', 'DESC']], limit });
    },

    getGammatag: async (parent: any, args: any ) => {
      const { id } = args
      return await models.Gammatag.findByPk(id);
    },

    getGammatagByName: async (parent: any, args: any ) => {
      const { name } = args
      return await models.Gammatag.findOne({ where: { name } });
    },
  },
};
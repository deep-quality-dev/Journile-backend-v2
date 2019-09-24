/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import Sequelize from 'sequelize';

import models from '../../models';

const Op = Sequelize.Op;

export default {
  Query: {
    getTrendingGammatags: async (parent: any, params: any ) => {
      const { count } = params

      return await models.Gammatag.findAll({ order: [['rate', 'DESC']], limit: count });
    },

    getGammatag: async (parent: any, params: any ) => {
      const { id } = params
      return await models.Gammatag.findByPk(id);
    },

    getGammatagByName: async (parent: any, params: any ) => {
      const { name } = params
      return await models.Gammatag.findOne({ where: { name } });
    },

    searchGammatag: async (parent: any, params: any ) => {
      const { name, count } = params
      return await models.Gammatag.findAll({ where: { name: { [Op.like]: `%${name}%` } },  order: [['rate', 'DESC']], limit: count });
    },
  },
};
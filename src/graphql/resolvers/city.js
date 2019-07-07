/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import Sequelize from 'sequelize';
const Op = Sequelize.Op;

import models from '../../models';

const include = { model: models.Country, as: 'country'}

export default {
  Query: {
    getCitiesByCountryID: async (parent: any, args: any) => {
      const { country_id } = args

      return await models.City.findAll({ where: { country_id }, include });
    },

    getCitiesByCountryCode: async (parent: any, args: any) => {
      const { country_code } = args

      return await models.City.findAll({ where: { country_id: country.id }, include });
    },

    getCity: async (parent: any, args: any) => {
      const { id } = args

      return await models.City.findByPk(id, { include });
    },

    getCityByName: async (parent: any, args: any) => {
      const { name } = args

      return await models.City.findOne({ where: { name: { [Op.like]: `%${name}%` } }, include });
    },
  },
};
/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { fieldsList } from 'graphql-fields-list';
import Sequelize from 'sequelize';

const Op = Sequelize.Op;

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
    getCitiesByCountryID: async (parent: any, args: any, context: any, info: any) => {
      const { country_id } = args
      const option = getQueryOption(info)

      return await models.City.findAll({ where: { country_id }, ...option });
    },

    getCitiesByCountryCode: async (parent: any, args: any, context: any, info: any) => {
      const { country_code } = args
      const option = getQueryOption(info)

      const country = await models.Country.findOne({ where: { country_code } });
      if (!country) {
        throw new UserInputError( `Can't find country with code: ${country_code}` );
      }

      return await models.City.findAll({ where: { country_id: country.id }, ...option });
    },

    getCity: async (parent: any, args: any, context: any, info: any) => {
      const { id } = args
      const option = getQueryOption(info)

      return await models.City.findByPk(id, { ...option });
    },

    getCityByName: async (parent: any, args: any, context: any, info: any) => {
      const { name } = args
      const option = getQueryOption(info)

      return await models.City.findOne({ where: { name: { [Op.like]: `%${name}%` } }, ...option });
    },
  },
};
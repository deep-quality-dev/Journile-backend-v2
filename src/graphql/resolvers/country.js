/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { fieldsList } from 'graphql-fields-list';

import models from '../../models';

function getQueryOption(info: any) {
  const fields = fieldsList(info);
  const option = {}
  if (fields.includes('cities')) {
    option['include'] = { model: models.City, as: 'cities' }
  }

  return option
}

export default {
  Query: {
    getCountries: async (parent: any, params: any, context: any, info: any) => {
      const option = getQueryOption(info)

      return await models.Country.findAll({ ...option });
    },

    getCountry: async (parent: any, params: any, context: any, info: any) => {
      const { id } = params
      const option = getQueryOption(info)

      return await models.Country.findByPk(id, { ...option });
    },

    getCountryByCode: async (parent: any, params: any, context: any, info: any) => {
      const { code } = params
      const option = getQueryOption(info)

      return await models.Country.findOne({ where: { country_code: code }, ...option });
    },

    getCountryByDialCode: async (parent: any, params: any, context: any, info: any) => {
      const { dial_code } = params
      const option = getQueryOption(info)

      return await models.Country.findOne({ where: { dial_code }, ...option });
    },
  },
};
/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';

import models from '../../models';

export default {
  Query: {
    getCountries: async (parent: any, args: any ) => {
      return await models.Country.findAll();
    },

    getCountry: async (parent: any, args: any ) => {
      const { id } = args
      return await models.Country.findByPk(id);
    },

    getCountryByCode: async (parent: any, args: any ) => {
      const { code } = args
      return await models.Country.findOne({ where: { country_code: code } });
    },

    getCountryByDialCode: async (parent: any, args: any ) => {
      const { dial_code } = args
      return await models.Country.findOne({ where: { dial_code } });
    },
  },
};
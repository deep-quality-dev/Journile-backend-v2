/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';

import models from '../../models';

export default {
  Query: {
    getLanguages: async (parent: any, params: any ) => {
      return await models.Language.findAll();
    },

    getLanguage: async (parent: any, params: any ) => {
      const { id } = params
      return await models.Language.findByPk(id);
    },

    getLanguageByCode: async (parent: any, params: any ) => {
      const { code } = params
      return await models.Language.findOne({ where: { code } });
    },
  },
};
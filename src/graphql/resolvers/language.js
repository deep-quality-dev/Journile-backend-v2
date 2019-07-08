/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';

import models from '../../models';

export default {
  Query: {
    getLanguages: async (parent: any, args: any ) => {
      return await models.Language.findAll();
    },

    getLanguage: async (parent: any, args: any ) => {
      const { id } = args
      return await models.Language.findByPk(id);
    },

    getLanguageByCode: async (parent: any, args: any ) => {
      const { code } = args
      return await models.Language.findOne({ where: { code } });
    },
  },
};
/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';

import models from '../../models';

export default {
  Query: {
    getCategories: async (parent: any, params: any ) => {
      return await models.Category.findAll();
    },

    getCategory: async (parent: any, params: any ) => {
      const { id } = params
      return await models.Category.findByPk(id);
    },
  },
};
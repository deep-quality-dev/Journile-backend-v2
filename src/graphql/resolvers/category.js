/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';

import models from '../../models';

export default {
  Query: {
    getCategories: async (parent: any, args: any ) => {
      return await models.Category.findAll();
    },

    getCategory: async (parent: any, args: any ) => {
      const { id } = args
      return await models.Category.findByPk(id);
    },
  },
};
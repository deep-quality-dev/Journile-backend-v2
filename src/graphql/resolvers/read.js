/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';

import models from '../../models';

export default {
  Query: {
    getUserReads: async (parent: any, args: any, context: any, info: any) => {
      const { user_id } = args

      return await models.Read.getUserReads(user_id);
    },
  },
};
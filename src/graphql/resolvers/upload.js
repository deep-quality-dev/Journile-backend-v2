/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';

import models from '../../models';
import logger from '../../middleware/logger';

export default {
  Mutation: {
    upload: async (parent: any, args: any, context: any, info: any) => {
      const { file } = args
      const { stream, filename, mimetype, encoding } = await file;
      logger.info('file', file)

      return { filename, mimetype, encoding };
    },
  },
};
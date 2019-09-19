/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';

import models from '../../models';
import uploader from '../../middleware/uploader';
import logger from '../../middleware/logger';

export default {
  Mutation: {
    upload: async (parent: any, args: any, context: any, info: any) => {
      const { file } = args
      const { createReadStream, filename, mimetype, encoding } = await file;
      const stream = createReadStream()

      const url = await uploader.uploadFileFromStream(stream, filename, mimetype);

      return { url, filename, mimetype, encoding };
    },
  },
};
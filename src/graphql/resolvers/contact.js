/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { fieldsList } from 'graphql-fields-list';

import models from '../../models';

function getQueryOption(info: any) {
  const fields = fieldsList(info);
  const option = {
    include: []
  }
  if (fields.includes('user')) {
    option['include'].push({ model: models.User, as: 'user' })
  }
  option['include'].push({ model: models.User, as: 'account' })

  return option
}

export default {
  Query: {
    getContacts: async (parent: any, args: any, context: any, info: any) => {
      const option = getQueryOption(info)

      return await models.Contact.findAll({ ...option });
    },

    getUserContacts: async (parent: any, args: any, context: any, info: any) => {
      const { user_id } = args
      const option = getQueryOption(info)

      return await models.Contact.findAll({ where: { user_id }, ...option });
    },
  },
};
/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { fieldsList } from 'graphql-fields-list';

import models from '../../models';

function getQueryOption(info: any) {
  const fields = fieldsList(info);
  const option = {}
  if (fields.includes('user')) {
    option['include'] = { model: models.User, as: 'user' }
  }

  return option
}

export default {
  Query: {
    getUserSetting: async (parent: any, params: any, context: any, info: any) => {
      const { user } = context
      if (!user) {
        throw new AuthenticationError("Not authorized");
      }
      const option = getQueryOption(info)

      return await models.UserSetting.findOne({ where: { user_id: user.id }, ...option });
    },

    getUserSettingByUserId: async (parent: any, params: any, context: any, info: any) => {
      const { user_id } = params
      const option = getQueryOption(info)

      return await models.UserSetting.findOne({ where: { user_id }, ...option });
    },
  },
};
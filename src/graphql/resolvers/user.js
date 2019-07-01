/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';

import config from '../../config';
import models from '../../models';

const createToken = async (user) => {
  const { id, username, email, first_name, last_name, status } = user;
  return await jwt.sign({ id, username, email, first_name, last_name, status }, config.secret_key, {
    expiresIn: config.token_expiresin
  });
};

export default {
  Query: {
    me: async (parent, args, { user }) => {
      if (!user) {
        return null;
      }

      return await models.User.findByPk(user.id);
    },
  },

  Mutation: {
    signin: async (
      parent,
      { input },
      { models, secret },
    ) => {
      const { login, password } = input
      const user = await models.User.findByLogin(login);

      if (!user) {
        throw new UserInputError(
          'No user found with this login credentials.',
        );
      }

      const isValid = await user.validatePassword(password);

      if (!isValid) {
        throw new AuthenticationError('Invalid password.');
      }

      return { token: createToken(user, secret, '30m') };
    },
  },
};
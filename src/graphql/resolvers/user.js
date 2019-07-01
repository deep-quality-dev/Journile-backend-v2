/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';

import config from '../../config';
import models from '../../models';
import { authenticateUser } from '../../middleware/passport';

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
      { input: { login, password } },
      { req, res }
    ) => {
      req.body = {
        ...req.body,
        login,
        password,
      };

      try {
        const { user, info } = await authenticateUser(req, res);

        if (!user) {
          throw new UserInputError(
            info.message
          );
        }

        return { token: createToken(user) };
      } catch (err) { throw err }
    },
  },
};
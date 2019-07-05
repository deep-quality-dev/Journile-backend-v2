/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import Joi from '@hapi/joi';

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
    me: async (parent: any, args: any, context: any ) => {
      const { user } = context
      if (!user) {
        return null;
      }

      return await models.User.findByPk(user.id);
    },
  },

  Mutation: {
    signin: async (parent: any, params: any, context: any) => {
      const { input: { login, password } } = params
      const { req, res } = context

      const schema = Joi.object().keys({
        // username: Joi.string().alphanum().min(3).max(30).required(),
        login: Joi.string().email({ minDomainSegments: 2 }).required(),
        password: Joi.string().min(3).max(30).required(),
      }).with('login', 'password');

      try {
        Joi.assert({ login, password }, schema);
      } catch (err) { throw  new UserInputError(err.details[0].message) }

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
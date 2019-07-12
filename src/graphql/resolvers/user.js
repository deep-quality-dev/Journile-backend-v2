/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import Joi from '@hapi/joi';

import config from '../../config';
import models from '../../models';
import { authenticateUser } from '../../middleware/passport';

const createToken = async (user, expiresIn) => {
  const { id, username, email, first_name, last_name, status } = user;
  return await jwt.sign({ id, username, email, first_name, last_name, status }, config.secret_key, { expiresIn });
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
        login: Joi.alternatives().try([
          Joi.string().email({ minDomainSegments: 2 }),
          Joi.string().regex(/^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/)
        ]).required(),
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

        const token = await createToken(user, config.token_expiresin)
        const refresh_token = await createToken(user, config.refresh_token_expiresin)

        await models.UserLogin.create({
          user_id: user.id,
          refresh_token,
          login_type: 0
        })

        return { token, refresh_token };
      } catch (err) { throw err }
    },
  },
};
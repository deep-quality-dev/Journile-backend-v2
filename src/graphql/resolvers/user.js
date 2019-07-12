/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import Sequelize from 'sequelize';
import jwt from 'jsonwebtoken';
import Joi from '@hapi/joi';

import config from '../../config';
import models from '../../models';
import { authenticateUser } from '../../middleware/passport';

const Op = Sequelize.Op;

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
    signup: async (parent: any, params: any, context: any) => {
      const { input: { email, password, username, first_name, last_name, phone_number } } = params
      const { req, res } = context

      const schema = Joi.object().keys({
        email: Joi.string().email({ minDomainSegments: 2 }).min(3).max(30),
        password: Joi.string().min(3).max(30).required(),
        username: Joi.string().regex(/^(?=.{4,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/).required(),
        first_name: Joi.string().max(15).required(),
        last_name: Joi.string().max(15).required(),
        phone_number: Joi.string().regex(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/),
      });

      try {
        Joi.assert({ email, password, username, first_name, last_name, phone_number }, schema);
      } catch (err) { throw  new UserInputError(err.details[0].message) }

      const duplication = await models.User.findOne({where: { [Op.or]: [{ email} , { username }] }});
      if (duplication) {
        throw new UserInputError(`Email or username is already exist`)
      }

      let clientip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection["socket"] ? req.connection["socket"].remoteAddress : null);
      clientip = ((clientip == null) ? 'undefined' : (clientip == '::1' ? '127.0.0.1' : clientip));
    },

    signin: async (parent: any, params: any, context: any) => {
      const { input: { login, password } } = params
      const { req, res } = context

      const schema = Joi.object().keys({
        login: Joi.alternatives().try([
          Joi.string().email({ minDomainSegments: 2 }),
          Joi.string().regex(/^(?=.{4,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/)
        ]).required(),
        password: Joi.string().min(3).max(30).required(),
      });

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
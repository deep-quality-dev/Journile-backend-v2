/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import Sequelize from 'sequelize';
import jwt from 'jsonwebtoken';
import Joi from '@hapi/joi';

import config from '../../config';
import models from '../../models';
import { authenticateScraper } from '../../middleware/passport';

const Op = Sequelize.Op;

const createToken = async (scraper: any, expiresIn: string) => {
  const { id, username, channel_id } = scraper;
  return await jwt.sign({ id, username, channel_id }, config.scraper_secret_key, { expiresIn });
};

export default {
  Mutation: {
    scraperSignin: async (parent: any, params: any, context: any) => {
      const { input: { username, password } } = params
      const { req, res } = context

      const schema = Joi.object().keys({
        username: Joi.string().regex(/^(?=.{4,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/).required(),
        password: Joi.string().min(3).max(30).required(),
      });

      try {
        Joi.assert({ username, password }, schema);
      } catch (err) { throw new UserInputError(err.details[0].message) }

      req.body = {
        ...req.body,
        username,
        password,
      };

      try {
        const { scraper, info } = await authenticateScraper(req, res);

        if (!scraper) {
          throw new UserInputError(
            info.message
          );
        }

        return await createToken(scraper, config.scraper_token_expiresin)
      } catch (err) { throw err }
    },
  },
};
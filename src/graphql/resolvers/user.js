/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import Sequelize from 'sequelize';
import jwt from 'jsonwebtoken';
import Joi from '@hapi/joi';
import geoip from 'geoip-lite';

import config from '../../config';
import models from '../../models';
import { authenticateUser } from '../../middleware/passport';
import mailer from '../../middleware/mailer';
import graph from '../../middleware/graph';

const Op = Sequelize.Op;

const createToken = async (user: any, expiresIn: string) => {
  const { id, username, email, first_name, last_name, status } = user;
  return await jwt.sign({ id, username, email, first_name, last_name, status }, config.secret_key, { expiresIn });
};

const generateRandomCode = (digit: number) => {
  const start = digit <= 1? 1: Math.pow(10, digit-1);
  return Math.floor(start + Math.random() * 9 * start);
}

const activeUser = async (user: any) => {
  let transaction;

  try {
    transaction = await models.transaction();

    await models.User.update({ status: 1}, { where: { id: user.id }, transaction });
    await models.Activation.update({ status: 1 }, { where: { id: user.activation.id }, transaction });
    await models.UserSetting.create({ user_id: user.id }, { transaction });
    const GIChannels = await models.Channel.findAll({ where: { type: 0 }, order: [['id', 'ASC']] });
    const readChannels = GIChannels.map(channel => {
      return {user_id: user.id, reading_id: channel.id, type: 1};
    })
    await models.Read.build(readChannels);

    await transaction.commit();

    graph.addUser(user.get({ plain: true }));
  } catch (err) {
    if (transaction) await transaction.rollback();
    throw err;
  }
}

const sendActivationMail = async (user: any) => {
  const {
    id,
    first_name,
    last_name,
    email,
  } = user;

  const activation: any = {};
  activation.user_id = id;
  activation.code = generateRandomCode(config.activation_code_digit);
  activation.hash = await jwt.sign({
      activation_code: activation.code,
      email,
      time: new Date().getTime()
    }, config.secret_key, { expiresIn: config.activation_code_expiresin });
  activation.link = `${config.web_root_url}${config.activation_link_url}?hval=${activation.hash}`;
  await models.Activation.create(activation);
  
  await mailer.sendConfirmationEmail({
    first_name,
    last_name,
    email,
    activation_code: activation.code,
    activation_link: activation.link
  });
}

export default {
  Query: {
    me: async (parent: any, params: any, context: any ) => {
      const { user } = context
      if (!user) {
        return null;
      }

      const option = {
        include: [{ model: models.Country, as: 'country' }, { model: models.City, as: 'city' }],
      }

      return await models.User.findByPk(user.id, option);
    },

    getUserByUsername: async (parent: any, params: any, context: any ) => {
      const { username } = params

      const option = {
        include: [{ model: models.Country, as: 'country' }, { model: models.City, as: 'city' }],
        where: { username },
      }

      return await models.User.findOne(option);
    },

    getUserActivity: async (parent: any, params: any, context: any ) => {
      const { username } = params

      const option = {
        nest: true,
        raw: true,
        attributes: [
          'id', 'username', 'email',
          [ Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('posts.id'))), 'posts' ],
          [ Sequelize.filter(Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('reading.id'))), { '$reading.type$': 0 }, models.PostRate), 'reading' ],
          [ Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('reader.id'))), 'readers' ],
          [ Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('comment.id'))), 'comments' ],
          [ Sequelize.filter(Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('rate.id'))), { '$rate.status$': 1 }, models.PostRate), 'like' ],
          [ Sequelize.filter(Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('rate.id'))), { '$rate.status$': 2 }, models.PostRate), 'dislike' ],
          [ Sequelize.filter(Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('posts.id'))), { '$posts.reissued_id$': { [Op.ne]: null } }, models.PostRate), 'reissue' ],
        ],
        include: [
          { model: models.Post, required: false, attributes: [] },
          { model: models.Read, as: 'reading', required: false, attributes: [], where: { '$reading.type$': 0, '$reading.status$': 1 } },
          { model: models.Read, as: 'reader', required: false, attributes: [], where: { '$reading.type$': 0, '$reading.status$': 1 } },
          { model: models.PostComment, as: 'comment', required: false, attributes: [] },
          { model: models.PostRate, as: 'rate', required: false, attributes: [] },
        ],
        group: ['user.id'],
        where: { username },
      }

      return await models.User.findOne(option);
    },
    
    getUserReading: async (parent: any, params: any, context: any, info: any) => {
      const { user_id, offset } = params
      const { user } = context
      
      const option = {
        subQuery: false,
        nest: true,
        raw: true,
        attributes: {
          include: [
            [ user? Sequelize.fn('COALESCE', Sequelize.fn('MAX', Sequelize.col('myRead.status')), 0): Sequelize.literal(0), 'reading' ],
          ]
        },
        include: [
          { model: models.Country, as: 'country', required: false },
          { model: models.City, as: 'city', required: false },
          { model: models.Read, as: 'reader', attributes: [], where: { status: 1 } },
        ],
        order: [ [{ model: models.Read, as: 'reader' }, 'id', 'DESC'], ],
        offset,
        limit: 20,
        group: [ 'user.id', 'country.id', 'city.id', 'reader.id' ],
        where: { '$reader.user_id$': user_id },
      }

      if (user) {
        option.include.push({ model: models.Read, as: 'myRead', attributes: [], required: false, where: { user_id: user.id, type: 0 } });
      }

      return await models.User.findAll(option);
    },
    
    getUserRecentReading: async (parent: any, params: any, context: any, info: any) => {
      const { user_id, count } = params
      
      const option = {
        subQuery: false,
        nest: true,
        include: [
          { model: models.Country, as: 'country', required: false },
          { model: models.City, as: 'city', required: false },
          { model: models.Read, as: 'reader', attributes: [], where: { status: 1 } },
        ],
        order: [ [{ model: models.Read, as: 'reader' }, 'id', 'DESC'], ],
        limit: count,
        group: [ 'user.id', 'country.id', 'city.id', 'reader.id' ],
        where: { '$reader.user_id$': user_id },
      }

      return await models.User.findAll(option);
    },
    
    getUserReaders: async (parent: any, params: any, context: any, info: any) => {
      const { user_id, offset } = params
      const { user } = context
      
      const option = {
        subQuery: false,
        nest: true,
        raw: true,
        attributes: {
          include: [
            [ user? Sequelize.fn('COALESCE', Sequelize.fn('MAX', Sequelize.col('myRead.status')), 0): Sequelize.literal(0), 'reading' ],
          ]
        },
        include: [
          { model: models.Country, as: 'country' },
          { model: models.City, as: 'city' },
          { model: models.Read, as: 'reading', attributes: [], where: { status: 1 } },
        ],
        order: [ [{ model: models.Read, as: 'reading' }, 'id', 'DESC'], ],
        offset,
        limit: 20,
        group: [ 'user.id', 'country.id', 'city.id', 'reading.id' ],
        where: { '$reading.reading_id$': user_id },
      }

      if (user) {
        option.include.push({ model: models.Read, as: 'myRead', attributes: [], required: false, where: { user_id: user.id, type: 0 } });
      }

      return await models.User.findAll(option);
    },
    
    getUserRecentReaders: async (parent: any, params: any, context: any, info: any) => {
      const { user_id, count } = params
      
      const option = {
        subQuery: false,
        nest: true,
        include: [
          { model: models.Country, as: 'country', required: false },
          { model: models.City, as: 'city', required: false },
          { model: models.Read, as: 'reading', attributes: [], where: { status: 1 } },
        ],
        order: [ [{ model: models.Read, as: 'reading' }, 'id', 'DESC'], ],
        limit: count,
        group: [ 'user.id', 'country.id', 'city.id', 'reading.id' ],
        where: { '$reading.reading_id$': user_id },
      }

      return await models.User.findAll(option);
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
      } catch (err) { throw new UserInputError(err.details[0].message) }

      const duplication = await models.User.findOne({where: { [Op.or]: [{ email } , { username }] }});
      if (duplication) {
        throw new UserInputError(`Email or username is already exist`)
      }

      // check location
      let clientip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection['socket'] ? req.connection['socket'].remoteAddress : null);
      clientip = ((clientip == null) ? 'undefined' : (clientip == '::1' ? '127.0.0.1' : clientip));
      
      let city_id, country_id, geo = geoip.lookup(clientip);
      if (geo) {
        const city_name = geo.city || 'Unknown';
        const city = await models.City.findOne({ where: { name: { [Op.like]: `%${city_name}%` } }});
        if (city) city_id = city.id;

        const country_code = geo.country || 'Unknown';
        let country = await models.Country.findOne({ where: { country_code }});
        if (country) country_id = country.id;
      }

      const result = await models.User.create({
        username,
        password,
        first_name,
        last_name,
        email,
        phone_number,
        signup_type: 0,
        country_id,
        city_id
      })
      const user = result.get({ plain: true});

      await sendActivationMail(user);

      return { ...user }
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
      } catch (err) { throw new UserInputError(err.details[0].message) }

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

        if (user.status >= 2) {
          throw new AuthenticationError('This account is blocked, please contact to support.');
        } else if (user.status < 1) {
          throw new AuthenticationError('This account isn\'t active. Please check our confirm email in your mailbox or resend.');
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

    activate: async (parent: any, params: any, context: any) => {
      const { input: { email, code } } = params

      const schema = Joi.object().keys({
        email: Joi.string().email({ minDomainSegments: 2 }).required(),
        code: Joi.string().required(),
      });

      try {
        Joi.assert({ email, code }, schema);
      } catch (err) { throw new UserInputError(err.details[0].message) }

      const user = await models.User.findOne({
        nest: true,
        raw: true,
        include: [
          { model: models.Country, as: 'country' },
          { model: models.City, as: 'city' },
          { model: models.Activation, as: 'activation' },
        ],
        order: [ [models.Activation, 'create_date', 'DESC'], ],
        where: { email }
      })

      if (!user || !user.activation) {
        throw new UserInputError('User not exist.')
      }

      if (user.status == 0) {
        const sendDate = new Date(user.activation.create_date),
            diff = (new Date()).getTime() - sendDate.getTime();
        if (user.activation.status == 0 && diff / 1000 < config.activation_code_expiresin) {
          if (user.activation.code == code) {
            await activeUser(user)
            return true;
          } else {
            throw new UserInputError('Activation code is invalid')
          }
        } else {
          await models.Activation.update({ status: 2 }, { where: { id: user.activation.id } })
          throw new Error('Activation code is expired.')
        }
      } else if (user.status == 1) {
        throw new Error('User is already active.')
      } else {
        throw new Error('Unable to active this user. Please contact to support.')
      }
    },

    requestActivation: async (parent: any, params: any, context: any) => {
      const { email } = params

      const schema = Joi.object().keys({
        email: Joi.string().email({ minDomainSegments: 2 }).required(),
      });

      try {
        Joi.assert({ email }, schema);
      } catch (err) { throw new UserInputError(err.details[0].message) }

      const user = await models.User.findOne({ where: { email } })

      if (!user) {
        throw new UserInputError('User not exist.')
      }

      await sendActivationMail(user);

      return true;
    }
  },
};
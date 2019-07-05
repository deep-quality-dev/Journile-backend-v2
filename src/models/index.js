/* @flow */

import Sequelize from 'sequelize';

import config from '../config';
import generateRedisModel from '../middleware/redismodel';

import category from './category';
import channel from './channel';
import post from './post';
import user from './user';

let sequelize: Sequelize = new Sequelize(
  config.db_name,
  config.db_user,
  config.db_pass,
  {
    host: config.db_host,
    port: config.db_port,
    dialect: config.db_dialect,
    pool: {
      max: 20,
      min: 0,
      idle: 10000
    },
  },
);

const models = {};
models.Category = generateRedisModel(category(sequelize, Sequelize))
models.Channel = generateRedisModel(channel(sequelize, Sequelize))
models.Post = generateRedisModel(post(sequelize, Sequelize))
models.User = generateRedisModel(user(sequelize, Sequelize))

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});

export { sequelize };

export default models;
/* @flow */

import Sequelize from 'sequelize';

import config from '../config';
import generateRedisModel from '../middleware/redismodel';

import category from './category';
import channel from './channel';
import city from './city';
import country from './country';
import gammatag from './gammatag';
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
models.City = generateRedisModel(city(sequelize, Sequelize))
models.Country = generateRedisModel(country(sequelize, Sequelize))
models.Gammatag = generateRedisModel(gammatag(sequelize, Sequelize))
models.Post = generateRedisModel(post(sequelize, Sequelize))
models.User = generateRedisModel(user(sequelize, Sequelize))


// Forign keys
models.Country.hasMany(models.City, { foreignKey: 'country_id' })
models.City.belongsTo(models.Country, { foreignKey: 'country_id' })

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});

export { sequelize };

export default models;
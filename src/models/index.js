/* @flow */

import Sequelize from 'sequelize';

import config from '../config';

let sequelize: Sequelize = new Sequelize(
  config.db_name,
  config.db_user,
  config.db_pass,
  {
    host: config.db_host,
    port: config.db_post,
    dialect: config.db_dialect,
    pool: {
      max: 20,
      min: 0,
      idle: 10000
    },
  },
);

const models = {
  User: sequelize.import('./user'),
  Post: sequelize.import('./post'),
};

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});

export { sequelize };

export default models;
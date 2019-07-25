/* @flow */

import Sequelize from 'sequelize';

import config from '../config';
import generateRedisModel from '../middleware/redismodel';

import activation from './activation';
import category from './category';
import channel from './channel';
import city from './city';
import contact from './contact';
import country from './country';
import gammatag from './gammatag';
import language from './language';
import postMedia from './post_media';
import postRate from './post_rate';
import post from './post';
import read from './read';
import user from './user';
import userLogin from './user_login';
import userSetting from './user_setting';

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
models.Activation = activation(sequelize, Sequelize)
models.Category = generateRedisModel(category(sequelize, Sequelize))
models.Channel = generateRedisModel(channel(sequelize, Sequelize))
models.City = generateRedisModel(city(sequelize, Sequelize))
models.Contact = generateRedisModel(contact(sequelize, Sequelize))
models.Country = generateRedisModel(country(sequelize, Sequelize))
models.Gammatag = generateRedisModel(gammatag(sequelize, Sequelize))
models.Language = generateRedisModel(language(sequelize, Sequelize))
models.PostMedia = generateRedisModel(postMedia(sequelize, Sequelize))
models.PostRate = generateRedisModel(postRate(sequelize, Sequelize))
models.Post = generateRedisModel(post(sequelize, Sequelize))
models.Read = generateRedisModel(read(sequelize, Sequelize))
models.User = generateRedisModel(user(sequelize, Sequelize))
models.UserLogin = userLogin(sequelize, Sequelize)
models.UserSetting = generateRedisModel(userSetting(sequelize, Sequelize))


// Forign keys
models.Country.hasMany(models.City, { foreignKey: 'country_id' })
models.City.belongsTo(models.Country, { foreignKey: 'country_id' })

models.Country.hasMany(models.Channel, { foreignKey: 'country_id' })
models.Channel.belongsTo(models.Country, { foreignKey: 'country_id' })


models.User.hasMany(models.Activation, { foreignKey: 'user_id' })
models.Activation.belongsTo(models.User, { foreignKey: 'user_id' })

models.User.hasMany(models.Contact, { foreignKey: 'user_id' })
models.Contact.belongsTo(models.User, { as:'user', foreignKey: 'user_id' })
models.Contact.belongsTo(models.User, { as:'account', foreignKey: 'account_id' })

models.User.hasMany(models.UserLogin, { foreignKey: 'user_id' })
models.UserLogin.belongsTo(models.User, { foreignKey: 'user_id' })

models.User.hasMany(models.Read, { foreignKey: 'user_id' })
models.Read.belongsTo(models.User, { foreignKey: 'user_id' })

models.User.hasOne(models.UserSetting, { foreignKey: 'user_id' })
models.UserSetting.belongsTo(models.User, { foreignKey: 'user_id' })


models.Category.hasMany(models.Post, { foreignKey: 'category_id' })
models.Post.belongsTo(models.Category, { foreignKey: 'category_id' })

models.Channel.hasMany(models.Post, { foreignKey: 'channel_id' })
models.Post.belongsTo(models.Channel, { foreignKey: 'channel_id' })

models.User.hasMany(models.Post, { foreignKey: 'author_id' })
models.Post.belongsTo(models.User, { as:'author', foreignKey: 'author_id' })

models.Post.hasMany(models.PostMedia, { foreignKey: 'post_id' })
models.PostMedia.belongsTo(models.Post, { foreignKey: 'post_id' })

models.Post.hasMany(models.PostRate, { foreignKey: 'post_id' })
models.PostRate.belongsTo(models.Post, { foreignKey: 'post_id' })

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});

models.transaction = async (option: any) => {
  return await sequelize.transaction(option)
}

export { sequelize };

export default models;
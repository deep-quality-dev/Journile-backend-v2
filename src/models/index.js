/* @flow */

import Sequelize from 'sequelize';

import config from '../config';
import generateRedisModel from '../middleware/redismodel';

import activation from './activation';
import bookmark from './bookmark';
import category from './category';
import channel from './channel';
import city from './city';
import contact from './contact';
import country from './country';
import gammatag from './gammatag';
import language from './language';
import postComment from './post_comment';
import postHidden from './post_hidden';
import postMedia from './post_media';
import postRate from './post_rate';
import postReport from './post_report';
import post from './post';
import read from './read';
import scraper from './scraper';
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

Sequelize.filter = (aggregation: any, filters: any, model: any) => {
  const filterFn = Array.isArray(filters)
    ? filters.length === 1
      ? filters[0]
      : Sequelize.and(...filters)
    : filters

  if (!filterFn) throw new Error('Missing filters!')
  if (!aggregation) throw new Error('Missing aggregation!')

  const query = sequelize.dialect.QueryGenerator.getWhereConditions(filterFn, model.name, model)
  const agg = sequelize.dialect.QueryGenerator.handleSequelizeMethod(aggregation, model.name, model)
  return Sequelize.literal(`${agg} FILTER (WHERE ${query})`)
}

const models = {};
models.Activation = activation(sequelize, Sequelize)
models.Bookmark = bookmark(sequelize, Sequelize)
models.Category = generateRedisModel(category(sequelize, Sequelize))
models.Channel = generateRedisModel(channel(sequelize, Sequelize))
models.City = generateRedisModel(city(sequelize, Sequelize))
models.Contact = generateRedisModel(contact(sequelize, Sequelize))
models.Country = generateRedisModel(country(sequelize, Sequelize))
models.Gammatag = generateRedisModel(gammatag(sequelize, Sequelize))
models.Language = generateRedisModel(language(sequelize, Sequelize))
models.PostComment = generateRedisModel(postComment(sequelize, Sequelize))
models.PostHidden = generateRedisModel(postHidden(sequelize, Sequelize))
models.PostMedia = generateRedisModel(postMedia(sequelize, Sequelize))
models.PostRate = postRate(sequelize, Sequelize)
models.PostReport = postReport(sequelize, Sequelize)
models.Post = generateRedisModel(post(sequelize, Sequelize))
models.Read = generateRedisModel(read(sequelize, Sequelize))
models.Scraper = scraper(sequelize, Sequelize)
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

models.Post.hasMany(models.PostComment, { as:'reply', foreignKey: 'post_id' })
models.PostComment.belongsTo(models.Post, { foreignKey: 'post_id' })
models.User.hasMany(models.PostComment, { foreignKey: 'user_id' })
models.PostComment.belongsTo(models.User, { foreignKey: 'user_id' })

models.Post.hasMany(models.PostHidden, { as: 'hidden', foreignKey: 'post_id' })
models.PostHidden.belongsTo(models.Post, { foreignKey: 'post_id' })
models.User.hasMany(models.PostHidden, { foreignKey: 'user_id' })
models.PostHidden.belongsTo(models.User, { foreignKey: 'user_id' })

models.Post.hasMany(models.PostMedia, { as:'media', foreignKey: 'post_id' })
models.PostMedia.belongsTo(models.Post, { foreignKey: 'post_id' })

models.Post.hasMany(models.PostRate, { as:'rate', foreignKey: 'post_id' })
models.PostRate.belongsTo(models.Post, { foreignKey: 'post_id' })

models.Post.hasMany(models.PostReport, { as: 'report', foreignKey: 'post_id' })
models.PostReport.belongsTo(models.Post, { foreignKey: 'post_id' })
models.User.hasMany(models.PostReport, { foreignKey: 'user_id' })
models.PostReport.belongsTo(models.User, { foreignKey: 'user_id' })

models.User.hasMany(models.Bookmark, { as: 'bookmark', foreignKey: 'user_id' })
models.Bookmark.belongsTo(models.User, { foreignKey: 'user_id' })
models.Post.hasMany(models.Bookmark, { as: 'bookmark', foreignKey: 'post_id' })
models.Bookmark.belongsTo(models.Post, { foreignKey: 'post_id' })

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
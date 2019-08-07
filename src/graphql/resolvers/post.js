/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import Sequelize from 'sequelize';

import models from '../../models';

const Op = Sequelize.Op;

function getQueryOption(info: any, user: any) {
  let option: any = {
    subQuery: false,
    include: [
      { model: models.Category, as: 'category' },
      { model: models.Channel, as: 'channel' },
      { model: models.User, as: 'author' },
      { model: models.PostMedia, as: 'media', attributes: [
        [ Sequelize.filter(Sequelize.fn('ARRAY_AGG', Sequelize.col("media.url")), { "$media.type$": 0 }, models.PostMedia), "images" ],
        [ Sequelize.filter(Sequelize.fn('ARRAY_AGG', Sequelize.col("media.url")), { "$media.type$": 1 }, models.PostMedia), "videos" ],
      ] },
      { model: models.PostRate, as: 'rate', attributes: [
        [ Sequelize.filter(Sequelize.fn('COUNT', Sequelize.col("rate.id")), { "$rate.status$": 1 }, models.PostRate), "like" ],
        [ Sequelize.filter(Sequelize.fn('COUNT', Sequelize.col("rate.id")), { "$rate.status$": 2 }, models.PostMedia), "dislike" ],
        [ user? Sequelize.filter(Sequelize.fn("AVG", Sequelize.col("rate.status")), { "$rate.user_id$": user.id }, models.PostMedia): 0, "status" ]
      ] },
      { model: models.PostComment, as: 'reply', attributes: [
        [ Sequelize.filter(Sequelize.fn('COUNT', Sequelize.col("reply.id")), { "$reply.status$": 0 }, models.PostComment), "count" ],
      ] },
      { model: models.Bookmark, attributes: [
        [ user? Sequelize.fn('COALESCE', Sequelize.col("bookmark.status"), 0): 0, "status" ],
      ] },
    ],
    order: [['original_post_date', 'DESC']],
    limit: 20,
    group: ["post.id", "category.id", "channel.id", "author.id"],
  }

  if (user) {
    option.include.push({ model: models.Bookmark })
    option.include.push({ model: models.PostHidden, as: 'hidden' })
    option.include.push({ model: models.PostReport, as: 'report' })
  }

  return option
}

function getPrivateQueryOption(info: any, user_id: number) {
  let option = getQueryOption(info)

}

export default {
  Query: {
    getPublicPosts: async (parent: any, params: any, context: any, info: any) => {
      const { date, isLater } = params
      let option = getQueryOption(info)

      option.where = { "$channel.type$": 0 }
      if (date) {
        option["where"]["$post.original_post_date$"] = isLater? { [Op.gte]: date } : { [Op.lt]: date }
      }

      // return await models.Post.findPublicPosts(date, isLater);
      return await models.Post.findAll({ ...option });
    },
    
    getPrivatePosts: async (parent: any, params: any, context: any, info: any) => {
      const { date, isLater } = params
      const { user } = context
      if (!user) {
        return [];
      }
      let option = getQueryOption(info)

      option.where = { "$channel.type$": 0 }
      if (date) {
        option.where["$post.original_post_date$"] = isLater? { [Op.gte]: date } : { [Op.lt]: date }
      }

      return await models.Post.findAll({ ...option });
    },
  },

  // Mutation: {
  // },
};
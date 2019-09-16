/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import Sequelize from 'sequelize';
import franc from "franc";
import langs from "langs";
import Joi from '@hapi/joi';

import models from '../../models';
import fileUploader from '../../middleware/uploader';
import logger from '../../middleware/logger';

const Op = Sequelize.Op;


const PostType = {
  Article: 0,
  Video: 1,
  Photo: 2,
  Location: 3,
  MultiMedia: 4,
};

const GammaTagLimitLength = 20;
const GammaTagLimitCount = 5;
const SpiderMaxContinuousLimit = 500;

function getQueryOption(info: any, user: any) {
  let option: any = {
    subQuery: false,
    nest: true,
    raw: true,
    attributes: {
      include: [
        [ user? Sequelize.fn('COALESCE', Sequelize.fn('MAX', Sequelize.col("bookmark.status")), 0): Sequelize.literal(0), "bookmark" ],
        [ user? Sequelize.fn('COALESCE', Sequelize.fn('MAX', Sequelize.col("hidden.status")), 0): Sequelize.literal(0), 'hidden' ],
        [ user? Sequelize.fn('COALESCE', Sequelize.fn('MAX', Sequelize.col("report.status")), 0): Sequelize.literal(0), 'report' ],
      ],
    },
    include: [
      { model: models.Category, as: 'category' },
      { model: models.Channel, as: 'channel' },
      { model: models.User, as: 'author' },
      { model: models.PostMedia, as: 'media', attributes: [
        [ Sequelize.filter(Sequelize.fn('ARRAY_AGG', Sequelize.col("media.url")), { "$media.type$": 0 }, models.PostMedia), "images" ],
        [ Sequelize.filter(Sequelize.fn('ARRAY_AGG', Sequelize.col("media.url")), { "$media.type$": 1 }, models.PostMedia), "videos" ],
      ], noPrimaryKey: true },
      { model: models.PostRate, as: 'rate', attributes: [
        [ Sequelize.filter(Sequelize.fn('COUNT', Sequelize.col("rate.id")), { "$rate.status$": 1 }, models.PostRate), "like" ],
        [ Sequelize.filter(Sequelize.fn('COUNT', Sequelize.col("rate.id")), { "$rate.status$": 2 }, models.PostRate), "dislike" ],
        [ user? Sequelize.fn('COALESCE', Sequelize.filter(Sequelize.fn("MAX", Sequelize.col("rate.status")), { "$rate.user_id$": user.id }, models.PostRate), 0): Sequelize.literal(0), "status" ]
      ], noPrimaryKey: true },
      { model: models.PostComment, as: 'reply', attributes: [
        [ Sequelize.filter(Sequelize.fn('COUNT', Sequelize.col("reply.id")), { "$reply.status$": 0 }, models.PostComment), "count" ],
      ], noPrimaryKey: true },
    ],
    order: [['original_post_date', 'DESC']],
    limit: 20,
    group: ["post.id", "category.id", "channel.id", "author.id"],
  }

  if (user) {
    option.include.push({ model: models.Bookmark, as: 'bookmark', required: false, attributes: [], where: { "$bookmark.user_id$": user.id } })
    option.include.push({ model: models.PostHidden, as: 'hidden', required: false, attributes: [], where: { "$hidden.user_id$": user.id } })
    option.include.push({ model: models.PostReport, as: 'report', required: false, attributes: [], where: { "$report.user_id$": user.id } })
  }

  return option
}

function languageFinder(description: string) {
  const detailsWithoutHtmlTags = description.replace(/<\/?[^>]+(>|$)/g, "");
  const lang3 = franc(detailsWithoutHtmlTags);
  let language = langs.where("3", lang3);
  if (language && language["1"]) {
    return language["1"];
  } else {
    return "en";
  }
}

function filterGammatags(gammatags: string[]) {
  gammatags = gammatags || []
  for (var i=0; i<gammatags.length; i++) {
    var tag = gammatags[i];
    tag = tag.replace(/[^a-zA-Z\d]/g, "").toLowerCase();
    gammatags[i] = tag;
  }
  
  gammatags = gammatags.filter(function(item, pos, self) {
    return item.length < GammaTagLimitLength && self.indexOf(item) == pos;
  });

  return gammatags.slice(0, GammaTagLimitCount);
}

export default {
  Query: {
    getPosts: async (parent: any, params: any, context: any, info: any) => {
      const { date, isLater } = params
      const { user } = context
      let option = getQueryOption(info, user)

      let where: any = {};
      if (user) {
        // private query
      } else {
        where = { "$channel.type$": 0 }
      }

      if (date) {
        where["$post.original_post_date$"] = isLater? { [Op.gte]: date } : { [Op.lt]: date }
      }
      option.where = where;

      return await models.Post.findAll({ ...option });
    },

    getHotTopics: async (parent: any, params: any, context: any, info: any) => {
      const { count } = params

      let option = getQueryOption(info)

      option.order = [Sequelize.literal('"rate.like" DESC'), ['original_post_date', 'DESC']]
      option.limit = count || 4
      option.where = { "status": 0 }

      return await models.Post.findAll({ ...option });
    },
    
    getUserPosts: async (parent: any, params: any, context: any, info: any) => {
      const { user_id, date, isLater } = params
      const { user } = context
      let option = getQueryOption(info, user)

      let where: any = { "author_id": user_id };
      
      if (date) {
        where["$post.original_post_date$"] = isLater? { [Op.gte]: date } : { [Op.lt]: date }
      }
      option.where = where;

      return await models.Post.findAll({ ...option });
    },
    
    getChannelPosts: async (parent: any, params: any, context: any, info: any) => {
      const { channel_id, date, isLater } = params
      const { user } = context
      let option = getQueryOption(info, user)

      let where: any = { channel_id };
      
      if (date) {
        where["$post.original_post_date$"] = isLater? { [Op.gte]: date } : { [Op.lt]: date }
      }
      option.where = where;

      return await models.Post.findAll({ ...option });
    },
  },

  Mutation: {
    userPost: async (parent: any, params: any, context: any) => {
      let { input: {
          title,
          description,
          cover_image,
          type,
          original_url,
          original_post_date,
          category_id,
          gamma_tags,
          images,
          videos,
          reissued_id,
          language
        }
      } = params;

      const schema = Joi.object().keys({
        title: Joi.string().min(3).max(256),
        cover_image: Joi.string().uri(),
        original_url: Joi.string().uri(),
        gamma_tags: Joi.array().items(Joi.string()).required(),
        images: Joi.array().items(Joi.string().uri()),
        videos: Joi.array().items(Joi.string().uri()),
      });

      try {
        Joi.assert({ title, cover_image, original_url, gamma_tags, images, videos }, schema);
      } catch (err) { throw new UserInputError(err.details[0].message) }

      try {
        const duplication = await models.Post.findAll({ where: { title: { [Op.like]: `%${title}%` }, original_url: { [Op.like]: `%${original_url}%` } } });
        logger.info('duplication', duplication)

        if (duplication.length > 0) {
          throw new UserInputError('Duplicated post');
        }

        if (!language) {
          language = languageFinder(description);
        }

      } catch (err) { throw err }
    },
    
    scraperPost: async (parent: any, params: any, context: any) => {
      const { scraper } = context
      if (!scraper) {
        return null;
      }

      let { input: {
          title,
          description,
          cover_image,
          type,
          original_url,
          original_post_date,
          category_id,
          gamma_tags,
          images,
          videos,
        }
      } = params;

      const schema = Joi.object().keys({
        title: Joi.string().min(3).max(256),
        cover_image: Joi.string().uri(),
        original_url: Joi.string().uri(),
        gamma_tags: Joi.array().items(Joi.string()).required(),
        images: Joi.array().items(Joi.string().uri()),
        videos: Joi.array().items(Joi.string().uri()),
      });

      try {
        Joi.assert({ title, cover_image, original_url, gamma_tags, images, videos }, schema);
      } catch (err) { throw new UserInputError(err.details[0].message) }

      let language, transaction;
      try {
        // const duplication = await models.Post.findAll({ where: { title: { [Op.like]: `%${title}%` }, original_url: { [Op.like]: `%${original_url}%` } } });

        // if (duplication.length > 0) {
        //   throw new UserInputError('Duplicated post');
        // }

        language = languageFinder(description);
        gamma_tags = [scraper.username].concat(gamma_tags);
        gamma_tags = filterGammatags(gamma_tags);
      } catch (err) { throw err }

      try {
        transaction = await models.transaction();

        logger.info('--------------------------------------------------------');
        let cover_image_url = null
        if (type != PostType.Photo && cover_image) {
          cover_image_url = await fileUploader.uploadImageFromUrl(cover_image);
        }

        const result = await models.Post.create({
          title,
          description,
          cover_image: cover_image_url,
          type,
          original_url,
          original_post_date,
          category_id,
          channel_id: scraper.channel_id,
          gamma_tags: gamma_tags.join(','),
          language,
        }, { transaction })
        const post_id = result.id

        logger.info('videos', videos);
        if (videos && videos.length > 0) {
          await models.PostMedia.uploadMedia(post_id, 1, videos, transaction);
        }
        if (images && images.length > 0) {
          await models.PostMedia.uploadMedia(post_id, 0, images, transaction);
        }
        // await savePolls(data, client, postId);

        // await gammatagClient.rateGammatags(data.gamma_tags, client);

        await transaction.commit();
        logger.info('--------------------------------------------------------');
        
        return post_id;
      } catch (err) {
        if (transaction) await transaction.rollback();
        throw err;
      }
    },
  },
};
/* @flow */

const POST_LIMIT_COUNT = 20

const getPostQuerySelect = (isPrivate: boolean = false) => {
  return `SELECT "post".*, 
    "user"."id" AS "author.id", "user"."username" AS "author.username", "user"."first_name" AS "author.first_name", "user"."last_name" AS "author.last_name", "user"."email" AS "author.email", "user"."phone_number" AS "author.phone_number", "user"."signup_type" AS "author.signup_type", "user"."level" AS "author.level", "user"."photo" AS "author.photo", "user"."cover_image" AS "author.cover_image", "user"."site_url" AS "author.site_url", "user"."country_id" AS "author.country_id", "user"."city_id" AS "author.city_id", "user"."description" AS "author.description", "user"."salt" AS "author.salt", "user"."status" AS "author.status", "user"."create_date" AS "author.create_date", "user"."update_date" AS "author.update_date", 
    "channel"."id" AS "channel.id", "channel"."name" AS "channel.name", "channel"."username" AS "channel.username", "channel"."email" AS "channel.email", "channel"."logo" AS "channel.logo", "channel"."cover_image" AS "channel.cover_image", "channel"."site_url" AS "channel.site_url", "channel"."country_id" AS "channel.country_id", "channel"."type" AS "channel.type", "channel"."description" AS "channel.description", "channel"."status" AS "channel.status", "channel"."create_date" AS "channel.create_date", "channel"."update_date" AS "channel.update_date", 
    "category"."id" AS "category.id", "category"."name" AS "category.name", "category"."tags" AS "category.tags", "category"."status" AS "category.status", "category"."create_date" AS "category.create_date", "category"."update_date" AS "category.update_date", 
    ARRAY_AGG("media"."url") FILTER (WHERE "media"."type"=0) AS "media.images", 
    ARRAY_AGG("media"."url") FILTER (WHERE "media"."type"=1) AS "media.videos", 
    COUNT(DISTINCT "rate"."id") FILTER (WHERE "rate"."status" = 1) AS "rate.like", 
    COUNT(DISTINCT "rate"."id") FILTER (WHERE "rate"."status" = 2) AS "rate.dislike", 
    ${isPrivate? `AVG("rate"."status") FILTER (WHERE "rate"."user_id" = ($1))`: '0'} AS "rate.status", 
    COUNT(DISTINCT "comment"."id") FILTER (WHERE "comment"."status" = 0) AS "reply.count", 
    ${isPrivate? `COALESCE("bookmark"."status", 0)`: '0'} AS "bookmark.status" 
    FROM "posts" AS "post" 
    LEFT OUTER JOIN "users" AS "user" ON "user"."id" = "post"."author_id" 
    LEFT OUTER JOIN "channels" AS "channel" ON "channel"."id" = "post"."channel_id" 
    LEFT OUTER JOIN "categories" AS "category" ON "category"."id" = "post"."category_id" 
    LEFT OUTER JOIN "post_medias" AS "media" ON "media"."post_id" = "post"."id" 
    LEFT OUTER JOIN "post_rates" AS "rate" ON "rate"."post_id" = "post"."id" 
    LEFT OUTER JOIN "post_comments" AS "comment" ON "comment"."post_id" = "post"."id" 
    ${isPrivate? `LEFT OUTER JOIN "bookmarks" AS "bookmark" ON "bookmark"."post_id" = "post"."id" AND "bookmark"."user_id" = ($1)) 
    LEFT OUTER JOIN "post_hiddens" AS "hidden" ON "hidden"."post_id" = "post"."id" AND "hidden"."user_id" = ($1)) 
    LEFT OUTER JOIN "post_reports" AS "report" ON "report"."post_id" = "post"."id" AND "report"."user_id" = ($1))` : ''}
  `;
}

const getPostQueryWhere = (isPrivate: boolean = false, date: ?string, isLater: ?boolean, status: ?number) => {
  return isPrivate? '':
    `WHERE "channel"."type" = 0 ${date? `AND "post"."original_post_date" <= '`+date+`' ` : ' '} ${ status != null ? `AND "post"."status" = `+status+` ` : ' ' }`
}

const post = (sequelize: any, DataTypes: any) => {
  const Post = sequelize.define('post', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.STRING,
    },
    cover_image: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true,
      },
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '0',
      validate: {
        isNumeric: true
      },
    },
    original_url: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isUrl: true,
      },
    },
    original_post_date: DataTypes.DATE,
    category_id: {
      type: DataTypes.INTEGER,
    },
    channel_id: {
      type: DataTypes.INTEGER,
    },
    author_id: {
      type: DataTypes.INTEGER,
    },
    gamma_tags: {
      type: DataTypes.STRING,
    },
    reissued_id: {
      type: DataTypes.INTEGER,
    },
    language: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '0',
      validate: {
        isNumeric: true
      },
    },
    create_date: DataTypes.DATE,
    update_date: DataTypes.DATE,
  }, {
    timestamps: false,
  });

  Post.findPublicPosts = async (date: ?string, isLater: ?boolean, status: ?number) => {
    let query = getPostQuerySelect();
    query += getPostQueryWhere(false, date, isLater)
    query += `GROUP BY "post"."id", "user"."id", "channel"."id", "category"."id" 
      ORDER BY "post"."original_post_date" DESC 
      LIMIT ${POST_LIMIT_COUNT} `

    try {
      return await sequelize.query(query, { nest: true, type: sequelize.QueryTypes.SELECT });
    } catch (err) {
      throw err
    }
  }

  return Post;
};

export default post;
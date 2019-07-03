/* @flow */

const POST_LIMIT_COUNT = 20

const getPostQuerySelect = (isPrivate: boolean = false) => {
  return `SELECT po.*, CONCAT(u.first_name, ' ', u.last_name) AS user_name, u.username AS user_nick, u.email AS user_email, u.photo AS user_photo,
    u.level AS user_level, ch.name AS channel_name, ch.username AS channel_nick, ch.email AS channel_email, ch.logo AS channel_logo,
    ca.name AS category_name, ch.cover_image AS channel_cover, u.cover_image AS user_cover, 
    COUNT(DISTINCT ra.id) FILTER (WHERE ra.status = 1) AS like, 
    COUNT(DISTINCT ra.id) FILTER (WHERE ra.status = 2) AS dislike, 
    COUNT(DISTINCT co.id) FILTER (WHERE co.status = 0) AS reply,
    ${isPrivate? `COALESCE(ram.status, 0)`: '0'} AS rate_status, 
    ${isPrivate? `COALESCE(bo.status, 0)`: '0'} AS bookmark_status, 
    ARRAY_AGG(me.url) FILTER (WHERE me.type=0) AS images, 
    ARRAY_AGG(me.url) FILTER (WHERE me.type=1) AS videos 
    FROM posts po 
    LEFT JOIN users         AS u    ON u.id = po.author_id 
    LEFT JOIN channels      AS ch   ON ch.id = po.channel_id 
    LEFT JOIN categories    AS ca   ON ca.id = po.category_id 
    LEFT JOIN post_rates    AS ra   ON ra.post_id = po.id 
    LEFT JOIN post_comments AS co   ON co.post_id = po.id 
    LEFT JOIN post_medias   AS me   ON me.post_id = po.id 
    ${isPrivate? `LEFT JOIN post_rates    AS ram  ON (ram.post_id = po.id AND ram.user_id = ($1)) 
    LEFT JOIN bookmarks     AS bo   ON (bo.post_id = po.id AND bo.user_id = ($1)) 
    LEFT JOIN post_hiddens  AS hid  ON (hid.post_id = po.id AND hid.user_id = ($1)) 
    LEFT JOIN post_reports  AS rep  ON (rep.post_id = po.id AND rep.user_id = ($1))` : ''}
  `;
}

const getPostQueryWhere = (isPrivate: boolean = false, date: ?string, isLater: ?boolean, status: ?number) => {
  return isPrivate? '':
    `WHERE ch.type = 0 ${date? " AND po.original_post_date <= '"+date+"'" : ' '} ${ status != null ? ' AND po.status = '+status+' ' : ' ' }`
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
    query += `GROUP BY po.id, u.id, ch.id, ca.id 
      ORDER BY po.original_post_date DESC 
      LIMIT ${POST_LIMIT_COUNT} `

    try {
      const posts = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT});

      return posts
    } catch (err) {
      throw err
    }
  }

  return Post;
};

export default post;
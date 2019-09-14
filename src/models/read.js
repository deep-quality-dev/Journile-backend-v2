/* @flow */

const read = (sequelize: any, DataTypes: any) => {
  const Read = sequelize.define('read', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    reading_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '0',
      validate: {
        notEmpty: true,
      },
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '1',
      validate: {
        isNumeric: true
      },
    },
    create_date: DataTypes.DATE,
    update_date: DataTypes.DATE,
  }, {
    timestamps: false,
  });

  Read.getUserReads = async (user_id: number) => {
    const query = `SELECT
      "read"."id", "read"."user_id", "read"."reading_id", "read"."type", "read"."status", "read"."create_date", "read"."update_date",
      "user"."id" AS "user.id", "user"."username" AS "user.username", "user"."password" AS "user.password", "user"."first_name" AS "user.first_name", "user"."last_name" AS "user.last_name", "user"."email" AS "user.email", "user"."phone_number" AS "user.phone_number", "user"."signup_type" AS "user.signup_type", "user"."level" AS "user.level", "user"."photo" AS "user.photo", "user"."cover_image" AS "user.cover_image", "user"."site_url" AS "user.site_url", "user"."country_id" AS "user.country_id", "user"."city_id" AS "user.city_id", "user"."description" AS "user.description", "user"."salt" AS "user.salt", "user"."status" AS "user.status", "user"."create_date" AS "user.create_date",
      "reading_user"."id" AS "reading.id", NULL AS "reading.name", "reading_user"."username" AS "reading.username", "reading_user"."first_name" AS "reading.first_name", "reading_user"."last_name" AS "reading.last_name", "reading_user"."email" AS "reading.email", "reading_user"."photo" AS "reading.photo", "reading_user"."cover_image" AS "reading.cover_image", "reading_user"."site_url" AS "reading.site_url"
      FROM "reads" AS "read"
      LEFT OUTER JOIN "users" AS "user" ON "read"."user_id" = "user"."id"
      LEFT OUTER JOIN "users" AS "reading_user" ON "read"."reading_id" = "reading_user"."id"
      WHERE "read"."type" = 0 AND "read"."user_id" = '${user_id}'
      UNION
      SELECT
      "read"."id", "read"."user_id", "read"."reading_id", "read"."type", "read"."status", "read"."create_date", "read"."update_date",
      "user"."id" AS "user.id", "user"."username" AS "user.username", "user"."password" AS "user.password", "user"."first_name" AS "user.first_name", "user"."last_name" AS "user.last_name", "user"."email" AS "user.email", "user"."phone_number" AS "user.phone_number", "user"."signup_type" AS "user.signup_type", "user"."level" AS "user.level", "user"."photo" AS "user.photo", "user"."cover_image" AS "user.cover_image", "user"."site_url" AS "user.site_url", "user"."country_id" AS "user.country_id", "user"."city_id" AS "user.city_id", "user"."description" AS "user.description", "user"."salt" AS "user.salt", "user"."status" AS "user.status", "user"."create_date" AS "user.create_date",
      "channel"."id" AS "reading.id", "channel"."name" AS "reading.name", "channel"."username" AS "reading.username", NULL AS "reading.first_name", NULL AS "reading.last_name", "channel"."email" AS "reading.email", "channel"."logo" AS "reading.photo", "channel"."cover_image" AS "reading.cover_image", "channel"."site_url" AS "reading.site_url"
      FROM "reads" AS "read"
      LEFT OUTER JOIN "users" AS "user" ON "read"."user_id" = "user"."id"
      LEFT OUTER JOIN "channels" AS "channel" ON "read"."reading_id" = "channel"."id"
      WHERE "read"."type" = 1 AND "read"."user_id" = '${user_id}'`;

    const results = await sequelize.query(query, { nest: true, type: sequelize.QueryTypes.SELECT });
    return results;
  }

  return Read;
};

export default read;
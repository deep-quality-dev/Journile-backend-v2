/* @flow */

const channel = (sequelize: any, DataTypes: any) => {
  const Channel = sequelize.define('channel', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    logo: {
      type: DataTypes.STRING,
    },
    cover_image: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true,
      },
    },
    site_url: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true,
      },
    },
    country_id: {
      type: DataTypes.INTEGER,
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '0',
      validate: {
        isNumeric: true
      },
    },
    description: {
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

  Channel.getHotChannels = async (limit: number) => {
    const query = `SELECT
      "channel".*, COUNT("read"."id") AS "reading",
      "country"."id" AS "country.id", "country"."name" AS "country.name", "country"."country_code" AS "country.country_code", "country"."dial_code" AS "country.dial_code", "country"."status" AS "country.status", "country"."create_date" AS "country.create_date", "country"."update_date" AS "country.update_date"
      FROM "channels" AS "channel"
      LEFT OUTER JOIN "reads" AS "read" ON "read"."reading_id" = "channel"."id"
      LEFT OUTER JOIN "countries" AS "country" ON "country"."id" = "channel"."country_id"
      WHERE "read"."type" = 1
      GROUP BY "channel"."id", "country.id"
      ORDER BY "reading" DESC
      LIMIT ${limit}`;

    const results = await sequelize.query(query, { nest: true, type: sequelize.QueryTypes.SELECT });
    return results;
  }

  return Channel;
};

export default channel;
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

  return Channel;
};

export default channel;
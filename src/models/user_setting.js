/* @flow */

const userSetting = (sequelize: any, DataTypes: any) => {
  const UserSetting = sequelize.define('user_setting', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    paypal_address: {
      type: DataTypes.STRING,
      unique: true,
    },
    show_balance_in_wallet: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        notEmpty: true,
      },
    },
    reader_tag_photo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        notEmpty: true,
      },
    },
    all_tag_photo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        notEmpty: true,
      },
    },
    personalization: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        notEmpty: true,
      },
    },
    personalization_ads: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        notEmpty: true,
      },
    },
    personalization_deivice: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        notEmpty: true,
      },
    },
    personalization_location: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        notEmpty: true,
      },
    },
    personalization_track: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        notEmpty: true,
      },
    },
    personalisation_share_partner: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        notEmpty: true,
      },
    },
    language: {
      type: DataTypes.STRING,
      unique: true,
      defaultValue: 'en',
      validate: {
        notEmpty: true
      },
    },
    monetize_content: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        notEmpty: true,
      },
    },
    find_by_email: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        notEmpty: true,
      },
    },
    find_by_phonenumber: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        notEmpty: true,
      },
    },
    content_only_pro: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        notEmpty: true,
      },
    },
    famliy_safe: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        notEmpty: true,
      },
    },
    theme: {
      type: DataTypes.STRING,
      unique: true,
      defaultValue: 'dark',
      validate: {
        notEmpty: true
      },
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

  return UserSetting;
};

export default userSetting;
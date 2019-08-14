/* @flow */

import Sequelize from 'sequelize';

import logger from '../middleware/logger';

const Op = Sequelize.Op;

const userLogin = (sequelize: any, DataTypes: any) => {
  const UserLogin = sequelize.define('user_login', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    login_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '0',
      validate: {
        isNumeric: true
      },
    },
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    lifetime: {
      type: DataTypes.BIGINT,
    },
    login: DataTypes.DATE,
    refresh: DataTypes.DATE,
    logout: DataTypes.DATE,
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

  UserLogin.beforeCreate(async userLogin => {
    try {
      await UserLogin.expireOldLogins(userLogin.user_id, userLogin.login_type);
    } catch (e) {
      logger.error(`Error on expiring old refresh tokens: ${e}`)
    }

    userLogin.login = new Date().toLocaleString()
  });

  UserLogin.expireOldLogins = async function(user_id: number, login_type: number) {
    await UserLogin.update({ logout: new Date().toLocaleString(), status: 3 }, { where: { user_id, login_type, status: { [Op.lt]: 3 } }});
  };

  return UserLogin;
};

export default userLogin;
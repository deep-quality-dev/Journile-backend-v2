/* @flow */

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
    tableName: 'user_login',
  });

  return UserLogin;
};

export default userLogin;
/* @flow */

import bcrypt from 'bcryptjs';


const generatePasswordHash = function(password: string) {
  const saltRounds = 10;
  let salt = bcrypt.genSaltSync(saltRounds);
  let hash = bcrypt.hashSync(password, salt);
  return {hash, salt};
};

const user = (sequelize: any, DataTypes: any) => {
  const User = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 200],
      },
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone_number: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isNumeric: true
      },
    },
    signup_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '0',
      validate: {
        isNumeric: true
      },
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '0',
      validate: {
        isNumeric: true
      },
    },
    photo: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true,
      },
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
    city_id: {
      type: DataTypes.INTEGER,
    },
    description: {
      type: DataTypes.STRING,
    },
    salt: {
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

  User.findByLogin = async login => {
    let user = await User.findOne({
      where: { username: login },
    });

    if (!user) {
      user = await User.findOne({
        where: { email: login },
      });
    }

    return user;
  };

  User.beforeCreate(function(user, options) {
    const {hash, salt} = generatePasswordHash(user.password);
    user.password = hash
    user.salt = salt
  });

  User.prototype.validatePassword = function(password: string) {
    return bcrypt.compare(password, this.password);
  };

  return User;
};

export default user;
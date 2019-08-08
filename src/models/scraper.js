/* @flow */

import bcrypt from 'bcryptjs';


const generatePasswordHash = function(password: string) {
  const saltRounds = 10;
  let salt = bcrypt.genSaltSync(saltRounds);
  let hash = bcrypt.hashSync(password, salt);
  return {hash, salt};
};

const scraper = (sequelize: any, DataTypes: any) => {
  const Scraper = sequelize.define('scraper', {
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
    channel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
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

  Scraper.findByUsername = async username => {
    return await Scraper.findOne({
      where: { username },
    });
  };

  Scraper.beforeCreate(function(user, options) {
    const {hash, salt} = generatePasswordHash(user.password);
    user.password = hash
    user.salt = salt
  });

  Scraper.prototype.validatePassword = function(password: string) {
    return bcrypt.compare(password, this.password);
  };

  return Scraper;
};

export default scraper;
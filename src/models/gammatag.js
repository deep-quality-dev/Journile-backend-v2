/* @flow */

const gammatag = (sequelize: any, DataTypes: any) => {
  const Gammatag = sequelize.define('gammatag', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    rate: {
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

  return Gammatag;
};

export default gammatag;
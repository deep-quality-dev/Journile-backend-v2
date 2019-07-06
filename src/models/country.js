/* @flow */

const country = (sequelize: any, DataTypes: any) => {
  const Country = sequelize.define('country', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    country_code: {
      type: DataTypes.STRING,
    },
    dial_code: {
      type: DataTypes.INTEGER,
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
    tableName: 'countries'
  });

  return Country;
};

export default country;
/* @flow */

const city = (sequelize: any, DataTypes: any) => {
  const City = sequelize.define('city', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    location: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    country_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'countries',
        key: 'id',
      },
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
    tableName: 'cities'
  });

  return City;
};

export default city;
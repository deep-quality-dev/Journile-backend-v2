/* @flow */

const category = (sequelize: any, DataTypes: any) => {
  const Category = sequelize.define('category', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    tags: {
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
    tableName: 'categories'
  });

  return Category;
};

export default category;
/* @flow */

const bookmark = (sequelize: any, DataTypes: any) => {
  const Bookmark = sequelize.define('bookmark', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    post_id: {
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

  return Bookmark;
};

export default bookmark;
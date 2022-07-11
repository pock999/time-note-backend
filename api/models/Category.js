// 自定義分類

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    'Category',
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      // 標籤顏色
      color: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: '#9DA6A4',
      },
    },
    {
      // options
      paranoid: true,
    }
  );

  Category.associate = function (models) {
    models.User.hasMany(Category);
    Category.belongsTo(models.User);

    Category.hasMany(models.Note);
    models.Note.belongsTo(Category);
  };

  return Category;
};

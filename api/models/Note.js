// 文章, 行程, 筆記

module.exports = (sequelize, DataTypes) => {
  const Note = sequelize.define(
    'Note',
    {
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      // 種類
      // 1 => 筆記
      // 2 => 行程(提醒)
      // 3 => 文章
      type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // 通常用在行程(提醒時間)，紀錄的時間
      timePoint: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      // options
      paranoid: true,
    }
  );

  Note.associate = function (models) {
    models.User.hasMany(Note);
    Note.belongsTo(models.User);
  };

  return Note;
};

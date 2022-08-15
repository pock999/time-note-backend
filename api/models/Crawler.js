// 爬蟲表

module.exports = (sequelize, DataTypes) => {
  const Crawler = sequelize.define(
    'Crawler',
    {
      key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      url: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
      // 上次爬取時間
      getDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      // options
      paranoid: true,
    }
  );

  return Crawler;
};

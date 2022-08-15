// 活動
module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define(
    'Event',
    {
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      location: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },

      date: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      type: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
    },
    {
      // options
      paranoid: true,
    }
  );

  return Event;
};

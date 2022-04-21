const bcrypt = require('bcrypt');

// 使用者
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
      },
    },
    {
      // options
      paranoid: true,

      hooks: {
        beforeCreate: async (instance, options) => {
          instance.dataValues.password = await bcrypt.hash(
            instance.dataValues.password,
            10
          );
        },
        beforeUpdate: async (instance, options) => {
          instance.dataValues.password = await bcrypt.hash(
            instance.dataValues.password,
            10
          );
        },
      },
    }
  );

  User.associate = function (models) {};
  
  return User;

};
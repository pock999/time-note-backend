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
        allowNull: false,
      },
      // 重設密碼時的token
      resetToken: {
        type: DataTypes.STRING(2000),
        allowNull: true,
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

  // classMethods
  User.test = function () {
    console.log('class methods: test()');
  };

  // instanceMethods
  User.prototype.validatePassword = async function (plaintextPassword) {
    const isVerify = await bcrypt.compare(plaintextPassword, this.password);
    return isVerify;
  };

  return User;
};

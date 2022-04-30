const dbModels = require('./api/models');

module.exports = async () => {
  // User
  const user1 = await dbModels.User.create({
    name: '王小明',
    email: 'ming123@google.com',
    password: 'abcd1234',
  });
};

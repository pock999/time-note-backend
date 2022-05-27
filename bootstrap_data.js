const dbModels = require('./api/models');
const dayjs = require('dayjs');

module.exports = async () => {
  // User
  const user1 = await dbModels.User.create({
    name: '王小明',
    email: 'ming123@google.com',
    password: 'abcd1234',
  });

  const ii = Array.from({ length: 24 }, (_, i) => i + 1);

  const now = dayjs();

  for (const i of ii) {
    await dbModels.Note.create({
      title: `標題${i}`,
      type: (i % 3) + 1,
      content: `內容!!!!!!,${i},${i},${i},${i},${i},${i},${i}`,
      startAt: now.subtract(7 + (30 - i), 'hour'),
      endAt: now.subtract(3 + (30 - i), 'hour'),
      UserId: user1.id,
    });
  }
};

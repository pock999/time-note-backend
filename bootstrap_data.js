const dbModels = require('./api/models');
const dayjs = require('dayjs');

module.exports = async () => {
  // User
  const user1 = await dbModels.User.create({
    name: '王小明',
    email: 'ming123@google.com',
    password: 'abcd1234',
  });

  const CategoriesName = [
    {
      name: '重要',
      color: '#F83637',
    },
    {
      name: '待辦',
      color: '#AADFC9',
    },
    {
      name: '閱讀清單',
      color: '#84C9E2',
    },
  ];

  const categoryIds = [];

  CategoriesName.map(async (cate) => {
    const category = await dbModels.Category.create({
      ...cate,
      UserId: user1.id,
    });

    categoryIds.push(category.id);
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
      CategoryId: categoryIds[i % 3],
    });
  }
};

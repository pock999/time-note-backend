const { expect } = require('chai');
const request = require('supertest');
const dayjs = require('dayjs');

const app = require('../../app');
const dbModels = require('../../api/models');

const callLogin = async ({ email, password }) => {
  const res = await request(app).post('/auth/login').send({
    email,
    password,
  });

  return _.get(res, 'body.data.token');
};

describe('=== 列表Category - GET /category/list ===', async () => {
  const now = dayjs();

  const userData = {
    name: '王小明',
    email: 'ming1234@google.com',
    password: 'abcd1234',
  };

  const categorysData = [
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

  beforeEach(async () => {
    await dbModels.sequelize.sync({ force: true, logging: false });

    await dbModels.User.destroy({ where: {}, truncate: true });

    const user = await dbModels.User.create(userData);

    await dbModels.Category.destroy({ where: {}, truncate: true });

    await dbModels.Category.bulkCreate(
      categorysData.map((item) => ({ ...item, UserId: user.id }))
    );
  });

  afterEach(async function () {
    await await dbModels.User.destroy({ where: {}, truncate: true });
    await await dbModels.Category.destroy({ where: {}, truncate: true });
  });

  it('- 獲取成功', async () => {
    const authorizationToken = await callLogin({
      ..._.pick(userData, ['email', 'password']),
    });

    const res = await request(app)
      .get('/category/list')
      .send({})
      .set({
        Authorization: `Bearer ${authorizationToken}`,
      });

    expect(res.statusCode).to.be.equal(200);
    expect(res.body.data.length).to.be.equal(3);
    expect(res.body.message).to.be.equal('success');
  });
});

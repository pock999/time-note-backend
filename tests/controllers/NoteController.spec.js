const { expect } = require('chai');
const request = require('supertest');

const app = require('../../app');
const dbModels = require('../../api/models');

const callLogin = async ({ email, password }) => {
  const res = await request(app).post('/auth/login').send({
    email,
    password,
  });

  return res.body.data.token;
};

describe('=== 新增note - GET /note/ ===', async () => {
  const userData = {
    name: '王小明',
    email: 'ming1234@google.com',
    password: 'abcd1234',
  };

  beforeEach(async () => {
    await dbModels.sequelize.sync({ force: true, logging: false });

    await dbModels.User.destroy({ where: {}, truncate: true });

    await dbModels.User.create(userData);
  });

  afterEach(async function () {
    await await dbModels.User.destroy({ where: {}, truncate: true });
  });

  describe('# 新增成功', async () => {
    const authorizationToken = await callLogin({
      ..._.pick(userData, ['email', 'password']),
    });

    it('- type: 1(筆記)', async () => {
      const res = await request(app)
        .post('/note/')
        .set({
          Authorization: `Bearer ${authorizationToken}`,
        })
        .send({
          title: '新標題',
          type: 1,
          content: '新內容',
          startAt: '2022-05-05 18:00:00',
          endAt: '2022-05-05 19:00:00',
        });

      expect(res.statusCode).to.be.equal(200);
      expect(res.body.message).to.be.equal('success');

      expect(res.body.data.title).to.be.equal('新標題');
      expect(res.body.data.type).to.be.equal(1);
      expect(res.body.data.content).to.be.equal('新內容');
      expect(res.body.data.startAt).to.be.equal('2022-05-05 18:00:00');
      expect(res.body.data.endAt).to.be.equal('2022-05-05 19:00:00');
    });

    it('- type: 2(行程(提醒))', async () => {});

    it('- type: 3(文章)', async () => {});
  });
});

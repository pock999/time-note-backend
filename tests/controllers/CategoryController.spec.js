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

describe('=== 單一Category - GET /category/:id ===', async () => {
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
      .get('/category/1')
      .set({
        Authorization: `Bearer ${authorizationToken}`,
      });

    expect(res.statusCode).to.be.equal(200);
    expect(res.body.message).to.be.equal('success');
    expect(res.body.data.id).to.be.equal(1);
    expect(res.body.data.name).to.be.equal(categorysData[0].name);
    expect(res.body.data.color).to.be.equal(categorysData[0].color);
  });

  it('- 獲取失敗(不存在)', async () => {
    const authorizationToken = await callLogin({
      ..._.pick(userData, ['email', 'password']),
    });

    const res = await request(app)
      .get('/category/1000')
      .set({
        Authorization: `Bearer ${authorizationToken}`,
      });

    expect(res.statusCode).to.be.equal(404);
    expect(res.body.message).to.be.equal('NotFound.Target.Not.Found');
  });
});

describe('=== 新增Category - POST /category ===', async () => {
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

  it('- 新增成功', async () => {
    const authorizationToken = await callLogin({
      ..._.pick(userData, ['email', 'password']),
    });

    const res = await request(app)
      .post('/category')
      .send({
        name: '測試',
        color: '#111111',
      })
      .set({
        Authorization: `Bearer ${authorizationToken}`,
      });

    expect(res.statusCode).to.be.equal(200);
    expect(res.body.message).to.be.equal('success');
    expect(res.body.data.name).to.be.equal('測試');
    expect(res.body.data.color).to.be.equal('#111111');
  });

  it('- 新增失敗(重複)', async () => {
    const authorizationToken = await callLogin({
      ..._.pick(userData, ['email', 'password']),
    });

    const res = await request(app)
      .post('/category')
      .send(categorysData[0])
      .set({
        Authorization: `Bearer ${authorizationToken}`,
      });

    expect(res.statusCode).to.be.equal(400);
    expect(res.body.message).to.be.equal('BadRequest.Data.Duplicated');
  });
});

describe('=== 更新Category - PUT /category:id ===', async () => {
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

  it('- 更新成功', async () => {
    const authorizationToken = await callLogin({
      ..._.pick(userData, ['email', 'password']),
    });

    const res = await request(app)
      .put('/category/1')
      .send({
        name: '測試',
        color: '#111111',
      })
      .set({
        Authorization: `Bearer ${authorizationToken}`,
      });

    expect(res.statusCode).to.be.equal(200);
    expect(res.body.message).to.be.equal('success');
    expect(res.body.data.name).to.be.equal('測試');
    expect(res.body.data.color).to.be.equal('#111111');
  });

  it('- 更新失敗(重複)', async () => {
    const authorizationToken = await callLogin({
      ..._.pick(userData, ['email', 'password']),
    });

    const res = await request(app)
      .put('/category/1')
      .send(categorysData[1])
      .set({
        Authorization: `Bearer ${authorizationToken}`,
      });

    expect(res.statusCode).to.be.equal(400);
    expect(res.body.message).to.be.equal('BadRequest.Data.Duplicated');
  });

  it('- 更新失敗(不存在)', async () => {
    const authorizationToken = await callLogin({
      ..._.pick(userData, ['email', 'password']),
    });

    const res = await request(app)
      .put('/category/1000')
      .send({
        name: '測試',
        color: '#111111',
      })
      .set({
        Authorization: `Bearer ${authorizationToken}`,
      });

    expect(res.statusCode).to.be.equal(404);
    expect(res.body.message).to.be.equal('NotFound.Target.Not.Found');
  });
});

describe('=== 刪除Category - DELETE /category:id ===', async () => {
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

  it('- 刪除成功', async () => {
    const authorizationToken = await callLogin({
      ..._.pick(userData, ['email', 'password']),
    });

    const res = await request(app)
      .delete('/category/1')
      .set({
        Authorization: `Bearer ${authorizationToken}`,
      });

    expect(res.statusCode).to.be.equal(200);
    expect(res.body.message).to.be.equal('success');
  });

  it('- 刪除失敗(不存在)', async () => {
    const authorizationToken = await callLogin({
      ..._.pick(userData, ['email', 'password']),
    });

    const res = await request(app)
      .delete('/category/1000')
      .set({
        Authorization: `Bearer ${authorizationToken}`,
      });

    expect(res.statusCode).to.be.equal(404);
    expect(res.body.message).to.be.equal('NotFound.Target.Not.Found');
  });
});

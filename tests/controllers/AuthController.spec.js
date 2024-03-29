const { expect } = require('chai');
const request = require('supertest');
const _ = require('lodash');

const app = require('../../app');
const dbModels = require('../../api/models');
const bcrypt = require('bcrypt');

const callLogin = async ({ email, password }) => {
  const res = await request(app).post('/auth/login').send({
    email,
    password,
  });

  return res.body.data.token;
};

describe('=== 登入 - POST /auth/login ===', () => {
  before(async () => {
    await dbModels.sequelize.sync({ force: true, logging: false });

    await dbModels.User.destroy({ where: {}, truncate: true });

    await dbModels.User.create({
      name: '王小明',
      email: 'ming123@google.com',
      password: 'abcd1234',
    });
  });

  describe('# 帳號或密碼未輸入', async () => {
    it('- 帳號未輸入', async () => {
      const res = await request(app).post('/auth/login').send({
        email: '',
        password: 'abcd1234',
      });

      expect(res.statusCode).to.be.equal(400);
      expect(res.body.payload.error).to.be.equal(
        '"email" is not allowed to be empty'
      );
    });

    it('- 密碼未輸入', async () => {
      const res = await request(app).post('/auth/login').send({
        email: 'ming123@google.com',
        password: '',
      });

      expect(res.statusCode).to.be.equal(400);
      expect(res.body.payload.error).to.be.equal(
        '"password" is not allowed to be empty'
      );
    });
  });

  it('- 無此使用者', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'ming124@google.com',
      password: '123erwerew',
    });

    expect(res.statusCode).to.be.equal(403);
    expect(res.body.payload.error).to.be.equal('找不到該使用者');
  });

  it('- 錯誤密碼', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'ming123@google.com',
      password: '123erwerew',
    });

    expect(res.statusCode).to.be.equal(403);
    expect(res.body.payload.error).to.be.equal('帳號或密碼錯誤');
  });

  it('- 正確帳密', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'ming123@google.com',
      password: 'abcd1234',
    });

    expect(res.statusCode).to.be.equal(200);
    expect(res.body.message).to.be.equal('success');
    expect(res.body.data.token).to.be.a('string');
    expect(res.body.data.user.email).to.be.equal('ming123@google.com');
  });

  after(async function () {
    await await dbModels.User.destroy({ where: {}, truncate: true });
  });
});

describe('=== 個人資料 - GET /auth/profile ===', () => {
  const userData = {
    name: '王小明',
    email: 'ming1234@google.com',
    password: 'abcd1234',
  };

  before(async () => {
    await dbModels.sequelize.sync({ force: true, logging: false });

    await dbModels.User.destroy({ where: {}, truncate: true });

    await dbModels.User.create(userData);
  });

  it('- 獲取成功', async () => {
    const authorizationToken = await callLogin({
      ..._.pick(userData, ['email', 'password']),
    });
    const res = await request(app)
      .get('/auth/profile')
      .send({})
      .set({
        Authorization: `Bearer ${authorizationToken}`,
      });

    expect(res.statusCode).to.be.equal(200);
    expect(res.body.data.user.email).to.be.equal(userData.email);
    expect(res.body.data.user.name).to.be.equal(userData.name);
  });

  after(async function () {
    await await dbModels.User.destroy({ where: {}, truncate: true });
  });
});

describe('=== 個人資料 - PUT /auth/profile ===', () => {
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

  it('- 只更新密碼', async () => {
    const authorizationToken = await callLogin({
      ..._.pick(userData, ['email', 'password']),
    });

    let res = await request(app)
      .put('/auth/profile')
      .set({
        Authorization: `Bearer ${authorizationToken}`,
      })
      .send({
        ..._.pick(userData, ['name']),
        password: 'newpassword',
      });

    expect(res.body.message).to.be.equal('success');

    // 再次登入(使用舊密碼)
    res = await request(app)
      .post('/auth/login')
      .send({
        ..._.pick(userData, ['email', 'password']),
      });

    expect(res.body.payload.error).to.be.equal('帳號或密碼錯誤');

    // 再次登入(使用新密碼)
    res = await request(app)
      .post('/auth/login')
      .send({
        ..._.pick(userData, ['email']),
        password: 'newpassword',
      });

    expect(res.statusCode).to.be.equal(200);
    expect(res.body.message).to.be.equal('success');
    expect(res.body.data.token).to.be.a('string');
    expect(res.body.data.user.email).to.be.equal(userData.email);
  });

  it('- 只更新名子', async () => {
    const authorizationToken = await callLogin({
      ..._.pick(userData, ['email', 'password']),
    });

    let res = await request(app)
      .put('/auth/profile')
      .set({
        Authorization: `Bearer ${authorizationToken}`,
      })
      .send({
        name: '新名字',
      });

    // 再次登入
    res = await request(app)
      .post('/auth/login')
      .send({
        ..._.pick(userData, ['email', 'password']),
      });

    expect(res.statusCode).to.be.equal(200);
    expect(res.body.message).to.be.equal('success');
    expect(res.body.data.token).to.be.a('string');
    expect(res.body.data.user.email).to.be.equal(userData.email);
    expect(res.body.data.user.name).to.be.equal('新名字');
  });

  it('- 更新密碼及名子', async () => {
    const authorizationToken = await callLogin({
      ..._.pick(userData, ['email', 'password']),
    });

    let res = await request(app)
      .put('/auth/profile')
      .set({
        Authorization: `Bearer ${authorizationToken}`,
      })
      .send({
        name: '新名字',
        password: 'newpassword',
      });

    // 再次登入(使用舊密碼)
    res = await request(app)
      .post('/auth/login')
      .send({
        ..._.pick(userData, ['email', 'password']),
      });

    expect(res.body.payload.error).to.be.equal('帳號或密碼錯誤');

    // 再次登入(使用新密碼)
    res = await request(app)
      .post('/auth/login')
      .send({
        ..._.pick(userData, ['email']),
        password: 'newpassword',
      });

    expect(res.statusCode).to.be.equal(200);
    expect(res.body.message).to.be.equal('success');
    expect(res.body.data.token).to.be.a('string');
    expect(res.body.data.user.email).to.be.equal(userData.email);
    expect(res.body.data.user.name).to.be.equal('新名字');
  });

  afterEach(async function () {
    await await dbModels.User.destroy({ where: {}, truncate: true });
  });
});

describe('=== 註冊 - POST /auth/register ===', () => {
  before(async () => {
    await dbModels.sequelize.sync({ force: true, logging: false });

    await dbModels.User.destroy({ where: {}, truncate: true });

    await dbModels.User.create({
      name: '王小明',
      email: 'ming123@google.com',
      password: 'abcd1234',
    });
  });

  it('- 重複Email', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'ming123@google.com',
      password: 'password',
      name: '測試',
    });

    expect(res.statusCode).to.be.equal(400);
    expect(res.body.payload.error).to.be.equal('Email 已被註冊');
  });

  it('- 少寫Email', async () => {
    const res = await request(app).post('/auth/register').send({
      password: 'password',
      name: '測試',
    });

    expect(res.statusCode).to.be.equal(400);
    expect(res.body.payload.error).to.be.equal('"email" is required');
  });

  it('- 少寫密碼', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'new-user@test.com',
      name: '測試',
    });

    expect(res.statusCode).to.be.equal(400);
    expect(res.body.payload.error).to.be.equal('"password" is required');
  });

  it('- 少寫名字', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'new-user@test.com',
      password: 'password',
    });

    expect(res.statusCode).to.be.equal(400);
    expect(res.body.payload.error).to.be.equal('"name" is required');
  });

  it('- 註冊成功', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'new-user@test.com',
      password: 'password',
      name: '測試',
    });

    expect(res.statusCode).to.be.equal(200);
    expect(res.body.message).to.be.equal('success');
    expect(res.body.data.email).to.be.equal('new-user@test.com');
    expect(res.body.data.name).to.be.equal('測試');
  });

  after(async function () {
    await await dbModels.User.destroy({ where: {}, truncate: true });
  });
});

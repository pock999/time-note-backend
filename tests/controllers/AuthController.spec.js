const { expect } = require('chai');
const request = require('supertest');

const app = require('../../app');
const dbModels = require('../../api/models');
const bcrypt = require('bcrypt');

describe('=== 登入 - POST /auth/login ===', () => {
  before(async () => {
    await dbModels.User.destroy({ where: {}, truncate: true });

    await dbModels.User.create({
      name: '王小明',
      email: 'ming123@google.com',
      password: 'abcd1234',
    });
  });

  describe('# 帳號或密碼未輸入', async () => {
    it('帳號未輸入', async () => {
      const res = await request(app).post('/auth/login').send({
        email: '',
        password: 'abcd1234',
      });

      expect(res.statusCode).to.be.equal(500);
      expect(res.body.data.error).to.be.equal(
        '"email" is not allowed to be empty'
      );
    });

    it('密碼未輸入', async () => {
      const res = await request(app).post('/auth/login').send({
        email: 'ming123@google.com',
        password: '',
      });

      expect(res.statusCode).to.be.equal(500);
      expect(res.body.data.error).to.be.equal(
        '"password" is not allowed to be empty'
      );
    });

    it('無此使用者', async () => {
      const res = await request(app).post('/auth/login').send({
        email: 'ming124@google.com',
        password: '123erwerew',
      });

      expect(res.statusCode).to.be.equal(500);
      expect(res.body.data.error).to.be.equal('the user not found');
    });

    it('錯誤密碼', async () => {
      const res = await request(app).post('/auth/login').send({
        email: 'ming123@google.com',
        password: '123erwerew',
      });

      expect(res.statusCode).to.be.equal(500);
      expect(res.body.data.error).to.be.equal('password error');
    });
  });
});

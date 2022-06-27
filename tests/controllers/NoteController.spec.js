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

  return res.body.data.token;
};

describe('=== 新增note - POST /note/ ===', async () => {
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
    const startAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const endAt = dayjs()
      .add(dayjs.duration({ hour: 1 }))
      .format('YYYY-MM-DD HH:mm:ss');

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
          startAt,
          endAt,
        });

      expect(res.statusCode).to.be.equal(200);
      expect(res.body.message).to.be.equal('success');

      expect(res.body.data.title).to.be.equal('新標題');
      expect(res.body.data.type).to.be.equal(1);
      expect(res.body.data.content).to.be.equal('新內容');
      expect(res.body.data.startAt).to.be.equal(startAt);
      expect(res.body.data.endAt).to.be.equal(endAt);
    });

    it('- type: 2(行程(提醒))', async () => {
      const res = await request(app)
        .post('/note/')
        .set({
          Authorization: `Bearer ${authorizationToken}`,
        })
        .send({
          title: '提醒',
          type: 2,
          content: '約會',
          startAt,
          endAt,
        });

      expect(res.statusCode).to.be.equal(200);
      expect(res.body.message).to.be.equal('success');

      expect(res.body.data.title).to.be.equal('提醒');
      expect(res.body.data.type).to.be.equal(2);
      expect(res.body.data.content).to.be.equal('約會');
      expect(res.body.data.startAt).to.be.equal(startAt);
      expect(res.body.data.endAt).to.be.equal(endAt);
    });

    it('- type: 3(文章)', async () => {
      const res = await request(app)
        .post('/note/')
        .set({
          Authorization: `Bearer ${authorizationToken}`,
        })
        .send({
          title: '新文章標題',
          type: 3,
          content: '今天天氣真好',
          startAt,
          endAt,
        });

      expect(res.statusCode).to.be.equal(200);
      expect(res.body.message).to.be.equal('success');

      expect(res.body.data.title).to.be.equal('新文章標題');
      expect(res.body.data.type).to.be.equal(3);
      expect(res.body.data.content).to.be.equal('今天天氣真好');
      expect(res.body.data.startAt).to.be.equal(startAt);
      expect(res.body.data.endAt).to.be.equal(endAt);
    });
  });

  describe('# 新增失敗', async () => {
    it('- 缺漏title', async () => {});
    it('- 缺漏type', async () => {});
    it('- 缺漏content', async () => {});

    describe('- type: 1(筆記)', async () => {
      it('- endAt比startAt小', async () => {});
    });

    describe('- type: 2(行程(提醒))', async () => {
      it('- endAt比startAt小', async () => {});
      it('- endAt比startAt大，但是比現在小', async () => {});
      it('- endAt比現在大，startAt比現在小', async () => {});
    });

    describe('- type: 3(文章)', async () => {
      it('- endAt比startAt小', async () => {});
    });
  });
});

describe('=== 列表note - GET /note/list ===', async () => {
  const now = dayjs();

  const userData = {
    name: '王小明',
    email: 'ming1234@google.com',
    password: 'abcd1234',
  };

  const notesData = Array.from({ length: 25 }, (_, i) => i + 1).map((i) => ({
    title: `標題${i}`,
    type: (i % 3) + 1,
    content: i % 6 === 0 ? '' : `${i},,, ${i},,, ${i}`,
    startAt: now.subtract(7 + (30 - i), 'hour'),
    endAt: now.subtract(3 + (30 - i), 'hour'),
    UserId: 1,
  }));

  beforeEach(async () => {
    await dbModels.sequelize.sync({ force: true, logging: false });

    await dbModels.User.destroy({ where: {}, truncate: true });

    await dbModels.User.create(userData);

    await dbModels.Note.destroy({ where: {}, truncate: true });

    await dbModels.Note.bulkCreate(notesData);
  });

  afterEach(async function () {
    await await dbModels.User.destroy({ where: {}, truncate: true });
    await await dbModels.Note.destroy({ where: {}, truncate: true });
  });
  describe('# 獲取成功', async () => {
    it('- 無條件', async () => {
      const authorizationToken = await callLogin({
        ..._.pick(userData, ['email', 'password']),
      });

      const res = await request(app)
        .get('/note/list')
        .send({})
        .set({
          Authorization: `Bearer ${authorizationToken}`,
        });

      expect(res.statusCode).to.be.equal(200);
      expect(res.body.data.length).to.be.equal(25);
      expect(res.body.message).to.be.equal('success');
    });

    describe('- 有條件', async () => {
      it('- 獲取當個月', async () => {
        const monthStart = now
          .month(now.month())
          .date(1)
          .hour(0)
          .minute(0)
          .second(0);

        const monthLast = now
          .month(now.month() + 1)
          .date(1)
          .hour(0)
          .minute(0)
          .second(0)
          .subtract(1, 'second');

        // 算原始資料有幾個
        let innerCount = 0;
        for (const note of notesData) {
          if (note.startAt > monthStart && note.endAt < monthLast) {
            innerCount += 1;
          }
        }

        const authorizationToken = await callLogin({
          ..._.pick(userData, ['email', 'password']),
        });

        const res = await request(app)
          .get(
            `/note/list?startAt=${encodeURIComponent(
              monthStart
            )}&endAt=${encodeURIComponent(monthLast)}`
          )
          .send({})
          .set({
            Authorization: `Bearer ${authorizationToken}`,
          });
        expect(res.statusCode).to.be.equal(200);

        // api 符合條件長度跟原始資料之符合條件長度比較
        expect(res.body.data.length).to.be.equal(innerCount);
        expect(res.body.message).to.be.equal('success');
      });
      it('- 獲取當日', async () => {
        const dateStart = now
          .month(now.month())
          .date(now.date())
          .hour(0)
          .minute(0)
          .second(0);

        const dateLast = now
          .month(now.month())
          .date(now.date() + 1)
          .hour(0)
          .minute(0)
          .second(0)
          .subtract(1, 'second');

        // 算原始資料有幾個
        let innerCount = 0;
        for (const note of notesData) {
          if (note.startAt > dateStart && note.endAt < dateLast) {
            innerCount += 1;
          }
        }

        const authorizationToken = await callLogin({
          ..._.pick(userData, ['email', 'password']),
        });

        const res = await request(app)
          .get(
            `/note/list?startAt=${encodeURIComponent(
              dateStart
            )}&endAt=${encodeURIComponent(dateLast)}`
          )
          .send({})
          .set({
            Authorization: `Bearer ${authorizationToken}`,
          });
        expect(res.statusCode).to.be.equal(200);

        // api 符合條件長度跟原始資料之符合條件長度比較
        expect(res.body.data.length).to.be.equal(innerCount);
        expect(res.body.message).to.be.equal('success');
      });
    });
  });
});

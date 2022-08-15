// 爬取同人展活動
const Joi = require('joi');
const { Op } = require('sequelize');
const axios = require('axios');
const dayjs = require('dayjs');
const cheerio = require('cheerio');

const dbModels = require('../../models');

module.exports = {
  // CWT
  async CWTList(req, res) {
    let nowTime = dayjs();

    let CWTWeb = await dbModels.Crawler.findOne({
      where: {
        key: 'CWT',
      },
    });

    if (!CWTWeb) {
      CWTWeb = await dbModels.Crawler.create({
        key: 'CWT',
        url: 'https://www.comicworld.com.tw/Acts/tw',
      });
    }

    // 沒爬過或是上次爬已經是1年前才爬
    if (
      !CWTWeb.getDate ||
      (CWTWeb.getDate && nowTime.diff(CWTWeb.getDate, 'year') > 0)
    ) {
      // https://www.comicworld.com.tw/Acts/tw
      const { data } = await axios.get(CWTWeb.url);

      const $ = cheerio.load(data);

      // 取得活動列表
      const elementList = $('div[class="activity"]');

      const eventList = [];

      for (const element of elementList) {
        const title = $(element).find('.a_c_tit').text();
        const address = `${$(element).find('.a_c_i')[1].next.data}(${
          $(element).find('.a_c_i')[2].next.data
        })`;

        const dateString = $(element).find('.a_c_i')[0].next.data;
        const [date1, date2] = dateString.split('/');
        const formatDate1 = date1
          .split('年')
          .reduce((pre, cur) => pre.concat(cur.split('月')), [])
          .join('-')
          .replace(' ', '');

        eventList.push({
          title: `${title} 第一天`,
          address,
          date: formatDate1,
        });

        const formatDate2 = [
          ...formatDate1.split('-').slice(0, 2),
          date2.replace('日', ''),
        ]
          .join('-')
          .replace(' ', '');

        eventList.push({
          title: `${title} 第二天`,
          address,
          date: formatDate1,
        });
      }

      CWTWeb.getDate = nowTime;
      await CWTWeb.save();
    } else {
      // TODO: 寫入資料表
    }

    return res.ok({
      message: 'success',
      data: {},
    });
  },
  // FF
};

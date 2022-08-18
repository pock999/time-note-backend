const packageJson = require('../../package.json');

module.exports = {
  // 取得平台資訊的API
  async Info(req, res) {
    try {
      return res.ok({
        message: 'success',
        data: {
          version: packageJson.version,
        },
      });
    } catch (e) {
      console.log('error => ', e);
      return res.error(e);
    }
  },
};

const dbModels = require('../models');

// 判斷是否為使用者
module.exports = async (req, res, next) => {
  console.log('==== isUser ====');
  try {
    let { user } = req;

    user = await dbModels.User.findOne({
      where: {
        id: user.id,
      },
    });

    if (!user) {
      throw ReturnMsg.AUTH.USER_NO_PERMISSION({
        error: '找不到該使用者',
      });
    }

    if (config.mail.isNeedActivate && !user.isActivate) {
      throw ReturnMsg.AUTH.USER_ACCESS_DENIED({
        error: '帳號未啟用',
      });
    }

    req.user = JsonReParse(user);

    next();
  } catch (e) {
    return res.error(e);
  }
};

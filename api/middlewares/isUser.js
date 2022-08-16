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
        error: 'the user not found',
      });
    }

    req.user = JsonReParse(user);

    next();
  } catch (e) {
    return res.error(e);
  }
};

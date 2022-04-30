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
      throw {
        error: 'user not found',
      };
    }

    req.user = JsonReParse(user);

    next();
  } catch (e) {
    return res.status(401).json({
      message: 'user not login',
      statusCode: 401,
      data: e,
    });
  }
};

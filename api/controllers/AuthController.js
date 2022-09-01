const Joi = require('joi');
const jwt = require('jsonwebtoken');

const dbModels = require('../models');

const MailService = require('../services/MailService');

module.exports = {
  async Login(req, res) {
    try {
      const { error, value } = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
      }).validate(req.body);

      if (error) {
        throw ReturnMsg.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
          error: error.message,
        });
      }

      const { email, password } = value;

      let user = await dbModels.User.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        throw ReturnMsg.AUTH.USER_NOT_FOUND({
          error: '找不到該使用者',
        });
      }

      const isVerify = await user.validatePassword(password);

      if (!isVerify) {
        throw ReturnMsg.AUTH.INVALID_PASSWORD({
          error: '帳號或密碼錯誤',
        });
      }

      if (config.mail.isNeedActivate && !user.isActivate) {
        throw ReturnMsg.AUTH.USER_ACCESS_DENIED({
          error: '帳號未啟用',
        });
      }

      user = {
        ..._.pick(JsonReParse(user), ['id', 'email', 'name']),
      };

      const token = jwt.sign(user, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      });

      return res.ok({
        message: 'success',
        data: {
          token,
          user,
        },
      });
    } catch (e) {
      console.log('error => ', e);
      return res.error(e);
    }
  },

  async Profile(req, res) {
    try {
      const { user } = req;

      const token = jwt.sign(user, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      });

      return res.ok({
        message: 'success',
        data: {
          user: { ..._.pick(user, ['id', 'email', 'name']) },
          token,
        },
      });
    } catch (e) {
      return res.error(e);
    }
  },

  async UpdateProfile(req, res) {
    try {
      const { error, value } = Joi.object({
        name: Joi.string().required(),
        password: Joi.string().min(8),
      }).validate(req.body);

      if (error) {
        throw ReturnMsg.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
          error: error.message,
        });
      }

      const { name, password } = value;

      const { user } = req;

      const findUser = await dbModels.User.findByPk(user.id);

      if (name) {
        findUser.name = name;
      }

      if (password) {
        findUser.password = password;
      }

      await findUser.save();

      return res.ok({
        message: 'success',
        data: {
          ..._.pick(JsonReParse(findUser), ['id', 'email', 'name']),
        },
      });
    } catch (e) {
      return res.error(e);
    }
  },

  async Register(req, res) {
    try {
      const { error, value } = Joi.object({
        email: Joi.string().required(),
        name: Joi.string().required(),
        password: Joi.string().min(8).required(),
      }).validate(req.body);

      if (error) {
        throw ReturnMsg.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
          error: error.message,
        });
      }

      const { email, password, name } = value;

      const isDuplicate = await dbModels.User.count({
        where: {
          email,
        },
      });

      if (isDuplicate) {
        throw ReturnMsg.AUTH.EMAIL_HAS_EXISTED({
          error: 'Email 已被註冊',
        });
      }

      const passToken = jwt.sign({ email, name }, config.activateJWT.secret, {
        expiresIn: config.activateJWT.expiresIn,
      });

      let user = await dbModels.User.create({
        name,
        email,
        password,
        // 有開通寄信，帳號預設未開通
        isActivate: !config.mail.isNeedActivate,
        activateCode: config.mail.isNeedActivate ? passToken : null,
      });

      if (config.mail.isNeedActivate) {
        const content = `
          感謝您註冊 Time-Note 帳號!!!<br/>
          點選以下連結已完成註冊<br/>
          <a target="_blank" href="${config.frontendURL}/activate?token=${passToken}"> --按我-- </a>
        `;
        await MailService.sendEmail('註冊信', content, user);
      }

      user = {
        ..._.pick(JsonReParse(user), ['id', 'email', 'name', 'isActivate']),
      };

      return res.ok({
        message: 'success',
        data: {
          ...user,
          isNeedActivate: config.mail.isNeedActivate,
        },
      });
    } catch (e) {
      console.log('error => ', e);
      return res.error(e);
    }
  },

  // 啟用
  async Activate(req, res) {
    try {
      const { error, value } = Joi.object({
        token: Joi.string().required(),
      }).validate(req.body);

      if (error) {
        throw ReturnMsg.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
          error: error.message,
        });
      }

      const { token } = value;

      const findUser = await dbModels.User.findOne({
        where: {
          activateCode: token,
        },
      });

      if (!findUser) {
        throw ReturnMsg.AUTH.USER_NOT_FOUND({
          error: '找不到該使用者或是開通碼',
        });
      }

      if (findUser.isActivate) {
        throw ReturnMsg.AUTH.USER_ACCESS_DENIED({
          error: '該帳號已開通',
        });
      }

      findUser.isActivate = true;
      findUser.activateCode = null;

      await findUser.save();

      return res.ok({
        message: 'success',
        data: null,
      });
    } catch (e) {
      console.log('error => ', e);
      return res.error(e);
    }
  },

  // 忘記密碼
  async ForgotPassword(req, res) {
    try {
      const { error, value } = Joi.object({
        email: Joi.string().required(),
      }).validate(req.body);

      if (error) {
        throw ReturnMsg.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
          error: error.message,
        });
      }

      const { email } = value;

      const findUser = await dbModels.User.findOne({
        where: {
          email,
        },
      });

      if (!findUser) {
        throw ReturnMsg.AUTH.USER_NOT_FOUND({
          error: '找不到該使用者',
        });
      }

      const passToken = jwt.sign(
        JsonReParse(findUser),
        config.activateJWT.secret,
        {
          expiresIn: config.activateJWT.expiresIn,
        }
      );

      if (!config.mail.isNeedActivate) {
        throw ReturnMsg.ERROR.SERVICE_NOT_ALLOW({
          error: '該服務未開啟',
        });
      }

      const content = `
          點擊進入重設密碼<br/>
          <a target="_blank" href="${config.frontendURL}/reset-password?token=${passToken}"> --按我-- </a>
        `;
      await MailService.sendEmail('忘記密碼', content, findUser);

      findUser.resetToken = passToken;
      await findUser.save();

      return res.ok({
        message: 'success',
        data: null,
      });
    } catch (e) {
      console.log('error => ', e);
      return res.error(e);
    }
  },

  // 忘記密碼後收信進入重設密碼
  async ResetPasssword(req, res) {
    try {
      const { error, value } = Joi.object({
        password: Joi.string().min(8).required(),
        token: Joi.string().required(),
      }).validate(req.body);

      if (error) {
        throw ReturnMsg.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
          error: error.message,
        });
      }

      if (!config.mail.isNeedActivate) {
        throw ReturnMsg.ERROR.SERVICE_NOT_ALLOW({
          error: '該服務未開啟',
        });
      }

      // 檢查token是否過期
      const { token, password } = value;
      const decodeUser = jwt.verify(token, config.activateJWT.secret);

      // reset password
      const findUser = await dbModels.User.findOne({
        where: {
          resetToken: token,
        },
      });

      findUser.password = password;
      findUser.resetToken = null;

      await findUser.save();

      return res.ok({
        message: 'success',
        data: null,
      });
    } catch (e) {
      console.log('error => ', e);
      return res.error(e);
    }
  },
};

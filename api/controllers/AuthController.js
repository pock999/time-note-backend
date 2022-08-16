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
          error: 'the user not found',
        });
      }

      const isVerify = await user.validatePassword(password);

      if (!isVerify) {
        throw ReturnMsg.AUTH.INVALID_PASSWORD({
          error: 'password error',
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
          error: 'email is duplicate',
        });
      }

      // TODO: 註冊信

      let user = await dbModels.User.create({
        name,
        email,
        password,
      });

      user = {
        ..._.pick(JsonReParse(user), ['id', 'email', 'name']),
      };

      return res.ok({
        message: 'success',
        data: user,
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

      // TODO: find by email

      // TODO: sign 一組大約 15m 的 jwtToken
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

      // TODO: 檢查token是否過期

      // TODO: reset password
    } catch (e) {
      console.log('error => ', e);
      return res.error(e);
    }
  },
};

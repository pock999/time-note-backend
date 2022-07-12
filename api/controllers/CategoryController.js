const Joi = require('joi');
const { Op } = require('sequelize');

const dbModels = require('../models');

const PageHelper = require('../services/PageHelper');

module.exports = {
  async List(req, res) {
    try {
      const { user } = req;

      const categories = await dbModels.Category.findAll({
        where: {
          UserId: user.id,
        },
      });

      const formatCategories = JsonReParse(categories);

      return res.ok({
        message: 'success',
        data: formatCategories.map((item) => ({
          ..._.pick(item, ['id', 'name', 'color']),
        })),
      });
    } catch (e) {
      console.log('error =>', e);
      return res.error(e);
    }
  },
  async Detail(req, res) {
    try {
      const { error, value } = Joi.object({
        id: Joi.number().integer().required(),
      }).validate(req.params);

      if (error) {
        throw ReturnMsg.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
          error: error.message,
        });
      }

      const { id } = value;

      const { user } = req;

      const category = await dbModels.Category.findOne({
        where: {
          UserId: user.id,
          id,
        },
      });

      if (!category) {
        throw ReturnMsg.NOT_FOUND.TARGET_NOT_FOUND({
          id,
        });
      }

      const formatCategory = JsonReParse(category);

      return res.ok({
        message: 'success',
        data: {
          ..._.pick(formatCategory, ['id', 'name', 'color']),
        },
      });
    } catch (e) {
      console.log('error =>', e);
      return res.error(e);
    }
  },
  async Create(req, res) {
    try {
      const { error, value } = Joi.object({
        name: Joi.string().required(),
        color: Joi.string().default('#9DA6A4'),
      }).validate(req.body);

      if (error) {
        throw ReturnMsg.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
          error: error.message,
        });
      }

      const { name, color } = value;

      const { user } = req;

      const isExist = await dbModels.Category.count({
        where: {
          UserId: user.id,
          name,
        },
      });

      if (isExist) {
        throw ReturnMsg.BAD_REQUEST.DATA_DUPLICATED({
          name,
        });
      }

      const category = await dbModels.Category.create({
        UserId: user.id,
        name,
        color,
      });

      const formatCategory = JsonReParse(category);

      return res.ok({
        message: 'success',
        data: {
          ..._.pick(formatCategory, ['id', 'name', 'color']),
        },
      });
    } catch (e) {
      console.log('error =>', e);
      return res.error(e);
    }
  },
  async Update(req, res) {
    try {
      const { error, value } = Joi.object({
        id: Joi.number().integer().required(),
        name: Joi.string().required(),
        color: Joi.string().default('#9DA6A4'),
      }).validate({
        ...req.body,
        ...req.params,
      });

      if (error) {
        throw ReturnMsg.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
          error: error.message,
        });
      }

      const { id, name, color } = value;

      const { user } = req;

      const category = await dbModels.Category.findOne({
        where: {
          UserId: user.id,
          id,
        },
      });

      if (!category) {
        throw ReturnMsg.NOT_FOUND.TARGET_NOT_FOUND({
          id,
        });
      }

      const isExist = await dbModels.Category.count({
        where: {
          UserId: user.id,
          name,
          id: {
            [Op.not]: id,
          },
        },
      });

      if (isExist) {
        throw ReturnMsg.BAD_REQUEST.DATA_DUPLICATED({
          name,
        });
      }

      category.name = name;
      category.color = color;
      await category.save();

      const formatCategory = JsonReParse(category);

      return res.ok({
        message: 'success',
        data: {
          ..._.pick(formatCategory, ['id', 'name', 'color']),
        },
      });
    } catch (e) {
      console.log('error =>', e);
      return res.error(e);
    }
  },
  async Delete(req, res) {
    try {
      const { error, value } = Joi.object({
        id: Joi.number().integer().required(),
      }).validate(req.params);

      if (error) {
        throw ReturnMsg.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
          error: error.message,
        });
      }

      const { id } = value;

      const { user } = req;

      const category = await dbModels.Category.findOne({
        where: {
          UserId: user.id,
          id,
        },
      });

      if (!category) {
        throw ReturnMsg.NOT_FOUND.TARGET_NOT_FOUND({
          id,
        });
      }

      const tx = await dbModels.sequelize.transaction();

      try {
        await dbModels.Note.update(
          {
            CategoryId: null,
          },
          {
            where: {
              UserId: user.id,
              CategoryId: id,
            },
            transaction: tx,
          }
        );

        await dbModels.Category.destroy({
          where: {
            UserId: user.id,
            id,
          },
          transaction: tx,
        });
        await tx.commit();
      } catch (err) {
        console.error('transaction err => ', err);
        await tx.rollback();
      }

      return res.ok({
        message: 'success',
        data: null,
      });
    } catch (e) {
      console.log('error =>', e);
      return res.error(e);
    }
  },
};

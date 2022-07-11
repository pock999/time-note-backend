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
          value: item.id,
          name: item.name,
          color: item.color,
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

      const formatCategory = JsonReParse(category);

      return res.ok({
        message: 'success',
        data: {
          value: formatCategory.id,
          name: formatCategory.name,
          color: formatCategory.color,
        },
      });
    } catch (e) {
      console.log('error =>', e);
      return res.error(e);
    }
  },
};

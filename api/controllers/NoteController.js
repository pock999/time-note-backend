const Joi = require('joi');

const dbModels = require('../models');

module.exports = {
  async Create(req, res) {
    try {
      const { error, value } = Joi.object({
        title: Joi.string().required(),
        type: Joi.number().integer().required(),
        content: Joi.string().required(),
        startAt: Joi.date(),
        endAt: Joi.date(),
      }).validate(req.body);

      if (error) {
        throw {
          error: error.message,
        };
      }

      const { user } = req;

      // TODO: 判斷type，決定 startAt, endAt 是否必要

      const note = await dbModels.Note.create({
        ...value,
        UserId: user.id,
      });

      const formatNote = JsonReParse(note);

      return res.status(200).json({
        message: 'success',
        statusCode: 200,
        data: {
          ..._.pick(formatNote, ['id', 'title', 'content', 'type']),
          startAt: formatNote.startAt
            ? dayjs(formatNote.startAt).format('YYYY-MM-DD HH:mm:ss')
            : null,
          endAt: formatNote.endAt
            ? dayjs(formatNote.endAt).format('YYYY-MM-DD HH:mm:ss')
            : null,
        },
      });
    } catch (e) {
      return res.status(500).json({
        message: 'error',
        statusCode: 500,
        data: e,
      });
    }
  },
};

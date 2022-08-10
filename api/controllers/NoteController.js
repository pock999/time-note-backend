const Joi = require('joi');
const { Op } = require('sequelize');

const dbModels = require('../models');

const NoteType = require('../enums/NoteType');
const PageHelper = require('../services/PageHelper');

module.exports = {
  async List(req, res) {
    try {
      const { error, value } = Joi.object({
        // 按時間起迄
        startAt: Joi.date(),
        endAt: Joi.date(),
        type: Joi.number()
          .integer()
          .valid(..._.map(NoteType, 'value')),
        CategoryId: Joi.number().integer(),
        // 預設需要分組
        page: Joi.number().default(1),
      }).validate({
        ...req.body,
        ...req.query,
      });

      const { user } = req;

      if (error) {
        throw ReturnMsg.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
          error: error.message,
        });
      }

      const { startAt, endAt, type, CategoryId, page } = value;

      const where = {};
      const order = [['startAt', 'DESC']];

      const paginater = await PageHelper.paginater({ page, pageSize: 20 });

      const findAllParameter = {
        where,
        order,
        include: [{ model: dbModels.Category }],
        ...paginater,
      };

      where.UserId = user.id;

      if (startAt) {
        where.startAt = {
          [Op.gte]: startAt,
        };
      }

      if (endAt) {
        where.endAt = {
          [Op.lte]: endAt,
        };
      }

      if (type !== null && typeof type !== 'undefined') {
        where.type = type;
      }

      if (CategoryId !== null && typeof CategoryId !== 'undefined') {
        where.CategoryId = CategoryId;
      }

      const { count, rows: notes } = await dbModels.Note.findAndCountAll({
        ...findAllParameter,
      });

      const formatNotes = JsonReParse(notes).map((item) => ({
        ..._.pick(item, ['id', 'title', 'content', 'type', 'Category']),
        startAt: item.startAt
          ? dayjs(item.startAt).format('YYYY-MM-DD HH:mm:ss')
          : null,
        endAt: item.endAt
          ? dayjs(item.endAt).format('YYYY-MM-DD HH:mm:ss')
          : null,
      }));

      return res.ok({
        message: 'success',
        data: formatNotes,
        paging: {
          totalCount: count,
          page,
          pageSize: 20,
        },
      });
    } catch (e) {
      console.log('error =>', e);
      return res.error(e);
    }
  },

  async GetTypes(req, res) {
    try {
      return res.ok({
        message: 'success',
        data: NoteType,
      });
    } catch (e) {
      console.log('error =>', e);
      return res.error(e);
    }
  },

  async Create(req, res) {
    try {
      const { error, value } = Joi.object({
        title: Joi.string().required(),
        type: Joi.number().integer().required(),
        CategoryId: Joi.number()
          .integer()
          .required()
          .allow(null)
          .allow('')
          .default(null),
        content: Joi.string().required(),
        startAt: Joi.date(),
        endAt: Joi.date(),
      }).validate(req.body);

      const nowTime = dayjs();

      if (error) {
        throw ReturnMsg.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
          error: error.message,
        });
      }

      const { user } = req;

      const { type, startAt, endAt, CategoryId } = value;
      // 行程(提醒), startAt和endAt為必填欄位
      if (type === 2 && (!startAt || !endAt)) {
        throw ReturnMsg.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
          error: 'startAt and endAt are required',
        });
      }

      // 行程(提醒), startAt以及endAt不可以比now還以前
      if (type === 2 && (dayjs() > dayjs(startAt) || dayjs() > dayjs(endAt))) {
        throw ReturnMsg.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
          error: 'startAt and endAt are need later than now',
        });
      }

      // 若startAt, endAt都有填寫，則確保大小為endAt >= startAt
      if (!!startAt && !!endAt) {
        if (dayjs(startAt) > dayjs(endAt)) {
          throw ReturnMsg.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
            error: 'endAt is need later than now',
          });
        }
      }

      const note = await dbModels.Note.create({
        // 若沒有startAt, endAt 把 now 補進去
        ..._.omit(value, ['startAt', 'endAt']),
        ...(!startAt ? { startAt: nowTime } : { startAt }),
        ...(!endAt ? { endAt: nowTime } : { endAt }),
        CategoryId: CategoryId === 0 ? null : CategoryId,
        UserId: user.id,
      });

      const formatNote = JsonReParse(note);

      return res.ok({
        message: 'success',
        data: {
          ..._.pick(formatNote, [
            'id',
            'title',
            'content',
            'type',
            'CategoryId',
          ]),
          startAt: formatNote.startAt
            ? dayjs(formatNote.startAt).format('YYYY-MM-DD HH:mm:ss')
            : null,
          endAt: formatNote.endAt
            ? dayjs(formatNote.endAt).format('YYYY-MM-DD HH:mm:ss')
            : null,
        },
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

      const note = await dbModels.Note.findOne({
        where: {
          id,
          UserId: user.id,
        },
      });

      if (!note) {
        throw ReturnMsg.NOT_FOUND.TARGET_NOT_FOUND({
          error: 'the note not found',
        });
      }

      const formatNote = JsonReParse(note);

      return res.ok({
        message: 'success',
        data: {
          ..._.pick(formatNote, [
            'id',
            'title',
            'content',
            'type',
            'CategoryId',
          ]),
          startAt: formatNote.startAt
            ? dayjs(formatNote.startAt).format('YYYY-MM-DD HH:mm:ss')
            : null,
          endAt: formatNote.endAt
            ? dayjs(formatNote.endAt).format('YYYY-MM-DD HH:mm:ss')
            : null,
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

        title: Joi.string().required(),
        type: Joi.number().integer().required(),
        CategoryId: Joi.number()
          .integer()
          .required()
          .allow(null)
          .allow('')
          .default(null),
        content: Joi.string().required(),
        startAt: Joi.date(),
        endAt: Joi.date(),
      }).validate({
        ...req.params,
        ...req.body,
      });

      if (error) {
        throw ReturnMsg.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
          error: error.message,
        });
      }

      const { user } = req;

      const { id, title, type, content, startAt, endAt, CategoryId } = value;

      const note = await dbModels.Note.findOne({
        where: {
          id,
          UserId: user.id,
        },
      });

      if (!note) {
        throw ReturnMsg.NOT_FOUND.TARGET_NOT_FOUND({
          error: 'the note not found',
        });
      }

      // 行程(提醒), startAt和endAt為必填欄位
      if (type === 2 && (!startAt || !endAt)) {
        throw ReturnMsg.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
          error: 'startAt and endAt are required',
        });
      }

      // 行程(提醒), startAt以及endAt不可以比now還以前
      if (type === 2 && (dayjs() > dayjs(startAt) || dayjs() > dayjs(endAt))) {
        throw ReturnMsg.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
          error: 'startAt and endAt are need later than now',
        });
      }

      // 若startAt, endAt都有填寫，則確保大小為endAt >= startAt
      if (!!startAt && !!endAt) {
        if (dayjs(startAt) > dayjs(endAt)) {
          throw ReturnMsg.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
            error: 'endAt is need later than now',
          });
        }
      }

      note.title = title;
      note.type = type;
      note.content = content;
      note.startAt = startAt;
      note.endAt = endAt;
      note.CategoryId = CategoryId === 0 ? null : CategoryId;
      await note.save();

      const formatNote = JsonReParse(note);

      return res.ok({
        message: 'success',
        data: {
          ..._.pick(formatNote, [
            'id',
            'title',
            'content',
            'type',
            'CategoryId',
          ]),
          startAt: formatNote.startAt
            ? dayjs(formatNote.startAt).format('YYYY-MM-DD HH:mm:ss')
            : null,
          endAt: formatNote.endAt
            ? dayjs(formatNote.endAt).format('YYYY-MM-DD HH:mm:ss')
            : null,
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

      const note = await dbModels.Note.findOne({
        where: {
          id,
          UserId: user.id,
        },
      });

      if (!note) {
        throw ReturnMsg.NOT_FOUND.TARGET_NOT_FOUND({
          error: 'the note not found',
        });
      }

      await dbModels.Note.destroy({
        where: {
          id,
          UserId: user.id,
        },
      });

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

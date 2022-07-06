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
        isGroup: Joi.number().default(1),
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

      const { startAt, endAt, type, CategoryId, isGroup } = value;

      const where = {};
      const order = [];

      const findAllParameter = {
        where,
        order,
        include: [{ model: dbModels.Category }],
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
        ..._.pick(item, ['id', 'title', 'content', 'type']),
        startAt: item.startAt
          ? dayjs(item.startAt).format('YYYY-MM-DD HH:mm:ss')
          : null,
        endAt: item.endAt
          ? dayjs(item.endAt).format('YYYY-MM-DD HH:mm:ss')
          : null,
      }));

      // 分組
      let groupNotes;

      // 需要分組再分組
      if (!!isGroup) {
        if (startAt) {
          // 相差天數
          const diffDay = endAt
            ? dayjs(endAt).diff(startAt, 'day')
            : dayjs().diff(startAt, 'day');

          groupNotes = formatNotes.reduce((group, data) => {
            let { startAt: dateTime } = data;
            dateTime = dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss');

            // 相差天數超過30天 => 1個月1組，其他1天1組
            if (diffDay > 30) {
              // slice(0, 7) => YYYY-MM
              group[dateTime.slice(0, 7)] = group[dateTime.slice(0, 7)] ?? [];
              group[dateTime.slice(0, 7)].push(data);
            } else {
              // slice(0, 10) => YYYY-MM-DD
              group[dateTime.slice(0, 10)] = group[startAt.slice(0, 10)] ?? [];
              group[dateTime.slice(0, 10)].push(data);
            }
            return group;
          }, {});
        } else {
          // 1個月1組
          groupNotes = formatNotes.reduce((group, data) => {
            let { startAt: dateTime } = data;
            dateTime = dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss');

            // slice(0, 7) => YYYY-MM
            group[dateTime.slice(0, 7)] = group[dateTime.slice(0, 7)] ?? [];
            group[dateTime.slice(0, 7)].push(data);
            return group;
          }, {});
        }

        // 依照key 大至小 排序
        groupNotes = Object.keys(groupNotes)
          .sort((a, b) => (a < b ? 1 : -1))
          .reduce((obj, key) => {
            obj[key] = groupNotes[key];
            return obj;
          }, {});
      } else {
        groupNotes = formatNotes;
      }

      return res.ok({
        message: 'success',
        data: {
          notes: groupNotes,
          isGroup,
        },
        paging: {
          totalCount: count,
        },
      });
    } catch (e) {
      console.log('error =>', e);
      return res.error(e);
    }
  },

  async GetType(req, res) {
    try {
      return res.ok({
        message: 'success',
        data: NoteType,
      });
    } catch (e) {
      return res.error(e);
    }
  },

  async Create(req, res) {
    try {
      const { error, value } = Joi.object({
        title: Joi.string().required(),
        type: Joi.number().integer().required(),
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

      const { type, startAt, endAt } = value;
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
        UserId: user.id,
      });

      const formatNote = JsonReParse(note);

      return res.ok({
        message: 'success',
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
      return res.error(e);
    }
  },
  async Update(req, res) {
    try {
      const { error, value } = Joi.object({
        id: Joi.number().integer().required(),

        title: Joi.string().required(),
        type: Joi.number().integer().required(),
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

      const { id, title, type, content, startAt, endAt } = value;

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
      await note.save();

      const formatNote = JsonReParse(note);

      return res.ok({
        message: 'success',
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
      return res.error(e);
    }
  },
};

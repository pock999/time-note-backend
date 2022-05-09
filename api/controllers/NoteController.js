const Joi = require('joi');
const { Op } = require('sequelize');

const dbModels = require('../models');

const PageHelper = require('../services/PageHelper');

module.exports = {
  async List(req, res) {
    try {
      const { error, value } = Joi.object({
        pageMode: Joi.string().required(), // 普通列表(需分頁) | 按時間起迄

        // 需分頁
        page: Joi.number().allow(null), // 第幾頁
        pageSize: Joi.number().allow(null), // 每頁顯示資料數量
        sort: Joi.string().allow(null), // 多欄位排序，例: 'id+desc,updatedAt+desc'

        // 按時間起迄
        startAt: Joi.date(),
        endAt: Joi.date(),
      }).validate({
        ...req.body,
        ...req.query,
      });

      const { user } = req;

      if (error) {
        throw {
          error: error.message,
        };
      }

      const { pageMode, page, sort, pageSize, startAt, endAt } = value;

      const where = {};
      const order = [];

      const findAllParameter = {
        where,
        order,
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

      if (pageMode === 'list') {
        // 排序
        if (sort) {
          const newOrder = await PageHelper.sorter({
            sort,
            modelForSort: RepairForm,
          });
          //
          // 改為新的多欄位排序方式
          //
          if (newOrder && newOrder.length > 0) {
            findAllParameter.order = newOrder;
          }
        } else {
          findAllParameter.order.push(['id', 'desc']);
        }

        // 分頁
        if (page && pageSize) {
          const { offset, limit } = await PageHelper.paginater({
            page,
            pageSize,
          });
          findAllParameter.offset = offset;
          findAllParameter.limit = limit;
        }

        const { count, rows: notes } = await dbModels.Note.findAndCountAll({
          ...findAllParameter,
        });

        let paging;
        if (page && pageSize) {
          paging = await PageHelper.getPaging({ page, pageSize, count });
        }

        const formatNotes = JsonReParse(notes);

        return res.status(200).json({
          message: 'success',
          data: formatNotes.map((note) => ({
            ..._.pick(note, ['id', 'title', 'content', 'type']),
            startAt: note.startAt
              ? dayjs(note.startAt).format('YYYY-MM-DD HH:mm:ss')
              : null,
            endAt: note.endAt
              ? dayjs(note.endAt).format('YYYY-MM-DD HH:mm:ss')
              : null,
          })),
          paging,
        });
      } else if (pageMode === 'calendar') {
        if (!startAt || !endAt) {
          throw {
            error: 'startAt and endAt are required',
          };
        }

        const notes = await dbModels.Note.findAll({
          ...findAllParameter,
        });

        const formatNotes = JsonReParse(notes);

        return res.status(200).json({
          message: 'success',
          data: formatNotes.map((note) => ({
            ..._.pick(note, ['id', 'title', 'content', 'type']),
            startAt: note.startAt
              ? dayjs(note.startAt).format('YYYY-MM-DD HH:mm:ss')
              : null,
            endAt: note.endAt
              ? dayjs(note.endAt).format('YYYY-MM-DD HH:mm:ss')
              : null,
          })),
        });
      } else {
        throw {
          error: 'pageMode is not defined',
        };
      }
    } catch (e) {
      return res.status(500).json({
        message: 'error',
        statusCode: 500,
        data: e,
      });
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

      if (error) {
        throw {
          error: error.message,
        };
      }

      const { user } = req;

      const { type, startAt, endAt } = value;
      // 行程(提醒), startAt和endAt為必填欄位
      if (type === 2 && (!startAt || !endAt)) {
        throw {
          error: 'startAt and endAt are required',
        };
      }

      // 行程(提醒), startAt以及endAt不可以比now還以前
      if (type === 2 && (dayjs() > dayjs(startAt) || dayjs() > dayjs(endAt))) {
        throw {
          error: 'startAt and endAt are need later than now',
        };
      }

      // 若startAt, endAt都有填寫，則確保大小為endAt >= startAt
      if (!!startAt && !!endAt) {
        if (dayjs(startAt) > dayjs(endAt)) {
          throw {
            error: 'endAt is need later than now',
          };
        }
      }

      // TODO: 若沒有startAt, endAt 可能要把 now 補進去

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
  async Detail(req, res) {
    try {
      const { error, value } = Joi.object({
        id: Joi.number().integer().required(),
      }).validate(req.params);

      if (error) {
        throw {
          error: error.message,
        };
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
        throw {
          error: 'the note not found',
        };
      }

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
        throw {
          error: error.message,
        };
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
        throw {
          error: 'the note not found',
        };
      }

      // 行程(提醒), startAt和endAt為必填欄位
      if (type === 2 && (!startAt || !endAt)) {
        throw {
          error: 'startAt and endAt are required',
        };
      }

      // 行程(提醒), startAt以及endAt不可以比now還以前
      if (type === 2 && (dayjs() > dayjs(startAt) || dayjs() > dayjs(endAt))) {
        throw {
          error: 'startAt and endAt are need later than now',
        };
      }

      // 若startAt, endAt都有填寫，則確保大小為endAt >= startAt
      if (!!startAt && !!endAt) {
        if (dayjs(startAt) > dayjs(endAt)) {
          throw {
            error: 'endAt is need later than now',
          };
        }
      }

      note.title = title;
      note.type = type;
      note.content = content;
      note.startAt = startAt;
      note.endAt = endAt;
      await note.save();

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
  async Delete(req, res) {
    try {
      const { error, value } = Joi.object({
        id: Joi.number().integer().required(),
      }).validate(req.params);

      if (error) {
        throw {
          error: error.message,
        };
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
        throw {
          error: 'the note not found',
        };
      }

      await dbModels.Note.destroy({
        where: {
          id,
          UserId: user.id,
        },
      });

      return res.status(200).json({
        message: 'success',
        statusCode: 200,
        data: null,
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

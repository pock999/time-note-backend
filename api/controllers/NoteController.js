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

      // TODO: 判斷type，決定 startAt, endAt 是否必要

      // TODO: 若為提醒，startAt以及endAt不可以比now還以前

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

const _ = require('lodash');

// all error catch
module.exports = (req, res, error) => {
  try {
    if (error.code) {
      switch (error.code) {
        case 400:
          return res.badReq({
            message: _.get(error, 'message') || 'BAD_REQUEST',
            payload: _.get(error, 'payload') || {},
          });
        case 401:
          return res.unAuth({
            message: _.get(error, 'message') || 'UNAUTHORIZED',
            payload: _.get(error, 'payload') || {},
          });
        case 403:
          return res.forbidden({
            message: _.get(error, 'message') || 'FORBIDDEN',
            payload: _.get(error, 'payload') || {},
          });
        case 404:
          return res.notFound({
            message: _.get(error, 'message') || 'NOT_FOUND',
            payload: _.get(error, 'payload') || {},
          });
        case 500:
          return res.notFound({
            message: _.get(error, 'message') || 'SERVER_ERROR',
            payload: _.get(error, 'payload') || {},
          });
        default: {
          return res.serverError(error);
        }
      }
    }

    if (
      error.name === 'SequelizeUniqueConstraintError' ||
      error.name === 'SequelizeValidationError'
    ) {
      return res.badReq({
        message: 'BAD_REQUEST.UNIQUE.CONSTRAINT',
        payload: error,
      });
    }

    return res.serverErr(e);
  } catch (e) {
    return res.serverErr(e);
  }
};

const _ = require('lodash');

// all error catch
module.exports = (req, res, error) => {
  try {
    if (error.code) {
      switch (error.code) {
        case 400:
          return res.badReq({
            type: _.get(error, 'type') || 'BadRequest',
            message: error.message,
            payload: _.get(error, 'payload') || {},
          });
        case 401:
          return res.unAuth({
            type: _.get(error, 'type') || 'UnAuthorized',
            message: error.message,
            payload: _.get(error, 'payload') || {},
          });
        case 403:
          return res.forbidden({
            type: _.get(error, 'type') || 'Forbidden',
            message: error.message,
            payload: _.get(error, 'payload') || {},
          });
        case 404:
          return res.notFound({
            type: _.get(error, 'type') || 'NotFound',
            message: error.message,
            payload: _.get(error, 'payload') || {},
          });
        case 500:
          return res.notFound({
            type: _.get(error, 'type') || 'ServerError',
            message: error.message,
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
        type: 'BadRequest',
        message: 'BadRequest.Unique.Constraint',
        payload: error,
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.badReq({
        type: 'BadRequest',
        message: 'Token.Not.Exist',
        payload: error,
      });
    }

    return res.serverErr(e);
  } catch (e) {
    return res.serverErr(e);
  }
};

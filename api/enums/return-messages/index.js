module.exports = {
  AUTH: {
    TOKEN_NOT_EXIST: (obj) => ({
      type: 'BadRequest.Auth.Token.Not.Exist',
      code: 400,
      payload: obj,
    }),
    USER_NOT_FOUND: (obj) => ({
      type: 'Forbidden.Auth.User.Not.Found',
      code: 403,
      payload: obj,
    }),
    EMAIL_HAS_EXISTED: (obj) => ({
      type: 'BadRequest.Auth.Email.Has.Exist',
      code: 400,
      payload: obj,
    }),
    INVALID_PASSWORD: (obj) => ({
      type: 'Forbidden.Auth.Invalid.Password',
      code: 403,
      payload: obj,
    }),
    EMPTY_PASSWORD: (obj) => ({
      type: 'Forbidden.Auth.Empty.Password',
      code: 403,
      payload: obj,
    }),
    USER_TOKEN_EXPIRED: (obj) => ({
      type: 'UnAuthorized.Auth.User.Token.Expired',
      code: 401,
      payload: obj,
    }),
    USER_NO_PERMISSION: (obj) => ({
      type: 'UnAuthorized.Auth.User.Not.Permission',
      code: 401,
      payload: obj,
    }),
    USER_ACCESS_DENIED: (obj) => ({
      type: 'Forbidden.Auth.User.Access.Denied',
      code: 403,
      payload: obj,
    }),
  },
  HINT: {},
  INFO: {},
  WARNING: {},
  SUCCESS: {},
  NOT_FOUND: {
    TARGET_NOT_FOUND: (obj) => ({
      message: 'NotFound.Target.Not.Found',
      code: 404,
      payload: obj,
    }),
  },
  BAD_REQUEST: {
    PARAMETER_FORMAT_INVALID: (obj) => ({
      message: 'BadRequest.Parameter.Format.Invalid',
      code: 400,
      payload: obj,
    }),
  },
  ERROR: {},
};

const jwt = require('jsonwebtoken');
const { TokenExpiredError } = jwt;

module.exports = async (req, res, next) => {
  console.log('==== jwtDecode ====');
  try {
    let token = req.headers.Authorization || req.headers.authorization;
    if (token && typeof token !== 'undefined') {
      if (token.includes('Bearer')) {
        token = token.replace('Bearer ', '');
      }

      const decodeToken = jwt.verify(token, config.jwt.secret);

      console.log('decodeToken => ', decodeToken);

      req.user = decodeToken;
    }

    next();
  } catch (e) {
    if (e instanceof TokenExpiredError) {
      return res.status(401).json({
        message: 'Unauthorized',
        statusCode: 401,
        data: 'token expired',
      });
    }

    return res.status(401).json({
      message: 'Unauthorized',
      statusCode: 401,
      data: e,
    });
  }
};

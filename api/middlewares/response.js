const responseTypes = require('./response-types');

module.exports = (req, res, next) => {
  for (const type of Object.keys(responseTypes)) {
    res[type] = (payload) =>
      responseTypes[type](req, res, JsonReParse(payload));
  }
  next();
};

const statusCode = 200;

module.exports = (req, res, payload) => {
  return res.status(statusCode).json({
    statusCode,
    ...JsonReParse(payload),
  });
};

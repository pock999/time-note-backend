const statusCode = 400;

module.exports = (req, res, payload) => {
  return res.status(statusCode).json({
    statusCode,
    ...JsonReParse(payload),
  });
};

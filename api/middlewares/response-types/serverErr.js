const statusCode = 500;

module.exports = (req, res, payload) => {
  return res.status(statusCode).json({
    statusCode,
    ...JsonReParse(payload),
  });
};

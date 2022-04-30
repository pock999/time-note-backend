const express = require('express');
const router = express.Router();

const AuthRouter = require('./AuthRouter');

router.use('/auth', AuthRouter);

router.all('*', (req, res) => {
  return res.status(404).json({
    message: 'not found',
    statusCode: 404,
    data: null,
  });
});

module.exports = router;

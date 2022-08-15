const express = require('express');
const router = express.Router();

const AuthRouter = require('./AuthRouter');
const NoteRouter = require('./NoteRouter');
const CategoryRouter = require('./CategoryRouter');
const FFRouter = require('./FFRouter');

router.use('/auth', AuthRouter);
router.use('/note', NoteRouter);
router.use('/category', CategoryRouter);
router.use('/ff', FFRouter);

router.all('*', (req, res) => {
  return res.status(404).json({
    message: 'not found',
    statusCode: 404,
    data: null,
  });
});

module.exports = router;

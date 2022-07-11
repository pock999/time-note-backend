const express = require('express');
const router = express.Router();

const CategoryController = require('../controllers/CategoryController');

const jwtDecode = require('../middlewares/jwtDecode');
const isUser = require('../middlewares/isUser');

router.get('/list', jwtDecode, isUser, CategoryController.List);
router.get('/:id', jwtDecode, isUser, CategoryController.Detail);

module.exports = router;

const express = require('express');
const router = express.Router();

const CategoryController = require('../controllers/CategoryController');

const jwtDecode = require('../middlewares/jwtDecode');
const isUser = require('../middlewares/isUser');

router.post('/', jwtDecode, isUser, CategoryController.Create);
router.get('/list', jwtDecode, isUser, CategoryController.List);
router.get('/:id', jwtDecode, isUser, CategoryController.Detail);
router.put('/:id', jwtDecode, isUser, CategoryController.Update);
router.delete('/:id', jwtDecode, isUser, CategoryController.Delete);

module.exports = router;

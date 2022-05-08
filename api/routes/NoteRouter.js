const express = require('express');
const router = express.Router();

const NoteController = require('../controllers/NoteController');

const jwtDecode = require('../middlewares/jwtDecode');
const isUser = require('../middlewares/isUser');

router.post('/', jwtDecode, isUser, NoteController.Create);
router.get('/list', jwtDecode, isUser, NoteController.List);

module.exports = router;

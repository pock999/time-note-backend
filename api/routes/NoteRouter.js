const express = require('express');
const router = express.Router();

const NoteController = require('../controllers/NoteController');

const jwtDecode = require('../middlewares/jwtDecode');
const isUser = require('../middlewares/isUser');

router.post('/', jwtDecode, isUser, NoteController.Create);
router.get('/list', jwtDecode, isUser, NoteController.List);
router.get('/:id', jwtDecode, isUser, NoteController.Detail);
router.put('/:id', jwtDecode, isUser, NoteController.Update);
router.delete('/:id', jwtDecode, isUser, NoteController.Delete);

module.exports = router;

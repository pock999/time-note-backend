const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');

const jwtDecode = require('../middlewares/jwtDecode');
const isUser = require('../middlewares/isUser');

router.post('/login', AuthController.Login);
router.get('/profile', jwtDecode, isUser, AuthController.Profile);

module.exports = router;

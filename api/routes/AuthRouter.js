const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');

const jwtDecode = require('../middlewares/jwtDecode');
const isUser = require('../middlewares/isUser');

router.post('/login', AuthController.Login);
router.post('/register', AuthController.Register);
router.post('/activate', AuthController.Activate);
router.get('/profile', jwtDecode, isUser, AuthController.Profile);
router.put('/profile', jwtDecode, isUser, AuthController.UpdateProfile);

module.exports = router;

const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');

/* GET home page. */
router.post('/login', AuthController.Login);

module.exports = router;

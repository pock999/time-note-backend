const express = require('express');
const router = express.Router();

const FFController = require('../controllers/crawler/FFController');

const jwtDecode = require('../middlewares/jwtDecode');
const isUser = require('../middlewares/isUser');

// TODO: middleware
router.get('/cwt/list', FFController.CWTList);

module.exports = router;

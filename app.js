const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const indexRouter = require('./api/routes/index');
const usersRouter = require('./api/routes/users');

const app = express();

const dbModels = require('./api/models');
// config
const config = require('./config/config');

// global
const dayjs = require('dayjs');
const _ = require('lodash');

global.dayjs = dayjs;
global._ = _;
global.JsonReParse = (obj) => JSON.parse(JSON.stringify(obj));
global.JsonSerialize = (obj) => JSON.stringify(obj);
global.JsonParse = (obj) => JSON.stringify(obj);
global.config = config;

dbModels.sequelize
  .sync(config.database.sync)
  .then(async () => {})
  .catch((err) => {
    console.log('error => ', err);
  });

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;

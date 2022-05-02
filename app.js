const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const routes = require('./api/routes');

const app = express();

const dbModels = require('./api/models');
// config
const config = require('./config/config');

// global
const dayjs = require('dayjs');
const _ = require('lodash');

const bootstrap_data = require('./bootstrap_data');

global.dayjs = dayjs;
global._ = _;
global.JsonReParse = (obj) => JSON.parse(JSON.stringify(obj));
global.JsonSerialize = (obj) => JSON.stringify(obj);
global.JsonParse = (obj) => JSON.parse(obj);
global.config = config;

dbModels.sequelize
  .sync(config.database.sync)
  .then(async () => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('=== sequelize.sync start ===');

      if (config.bootstrapData === true) {
        console.log('=== bootstrap data start ===');
        await bootstrap_data();
        console.log('=== bootstrap data end ===');
      }

      console.log('=== sequelize.sync end ===');
    }
  })
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
app.use(cors(corsOptions));

app.use('/', routes);

module.exports = app;

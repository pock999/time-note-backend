module.exports = {
  port: 3000,
  frontendURL: 'http://localhost:9000', // 前端 URL

  bootstrapData: false,

  // postgres

  // database: {
  //   dialect: 'postgres',
  //   port: '5433',
  //   name: 'time-note',
  //   username: 'postgres',
  //   password: '',
  //   dialectOptions: {
  //     charset: 'utf8mb4',
  //     useUTC: false, //for reading from database
  //   },
  //   sync: {
  //     force: true,
  //   },
  //   logging: false,
  //   timezone: '+08:00', //for writing to database
  // },

  // mariadb

  database: {
    host: 'localhost',
    dialect: 'mariadb',
    name: 'time-note',
    username: 'root',
    password: '',
    dialectOptions: {
      charset: 'utf8mb4',
      useUTC: false, //for reading from database
    },
    sync: {
      force: true,
    },
    logging: false,
    timezone: '+08:00', //for writing to database
  },

  jwt: {
    secret: 'secret',
    expiresIn: '1h', // 1小時
  },

  // 帳號激活用 / 重設密碼
  activateJWT: {
    secret: 'secret',
    expiresIn: '15m',
  },

  mail: {
    isNeedActivate: false,
    email: '<email account>',
    password: '<email password>',
  },
};

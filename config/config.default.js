module.exports = {
  port: 3000,
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
    expiresIn: '15m', // 15分
  },

  mail: {
    isActivate: false,
    email: '<email account>',
    password: '<email password>',
  },
};

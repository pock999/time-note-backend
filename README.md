## Time-Note-Backend (後端API)
前端(frontend): 👉🏻 [這裡](https://github.com/pock999/time-note-frontend)

### TODO

- [ ] 爬蟲(活動)
- [ ] 把活動加入 note(看新開type或是提醒)

## Description
一個備忘紀錄的系統。

## How to use and run the project
1. clone 此專案
2. 執行 `npm install` | `yarn` 安裝所需套件
3. 複製 `config/config.default.js` 成 `config/config.js`
4. 更改 `config.js` 裡面的設定檔(根據您的mariadb帳號密碼)，若沒安裝mariadb，請參考[這裡](https://www.mariadbtutorial.com/getting-started/install-mariadb/)
5. 執行 `npm run start` | `yarn start`

## How to use


## 使用技術
- Express([網址](https://expressjs.com/)): 後端框架
- Sequelize([網址](https://sequelize.org/)): 資料庫ORM
- MariaDB([網址](https://mariadb.org/)): 資料庫 
- mocha([網址](https://mochajs.org/)): 測試框架，本專案嘗試搭配 [nyc]((https://istanbul.js.org/)) 進行測試的覆蓋率

## 參考資料
- [在 node.js 寫測試-mocha+chai 斷言庫+supertest 模擬連線+sinon 替身+nyc 統計覆蓋率](https://medium.com/@stupidcoding/%E5%9C%A8node-js%E5%AF%AB%E6%B8%AC%E8%A9%A6-mocha-chai%E6%96%B7%E8%A8%80%E5%BA%AB-supertest%E6%A8%A1%E6%93%AC%E9%80%A3%E7%B7%9A-sinon%E6%9B%BF%E8%BA%AB-nyc%E7%B5%B1%E8%A8%88%E8%A6%86%E8%93%8B%E7%8E%87-f736c423b893)

## MIT
### The MIT License
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)  
`[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)`

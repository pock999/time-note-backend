const _ = require('lodash');

module.exports = {
  // sequelize分頁條件
  async paginater({ page, pageSize }) {
    const index = page - 1 >= 0 ? page - 1 : 0;
    const limit = pageSize >= 0 ? pageSize : 0;

    return {
      offset: limit * index,
      limit,
    };
  },

  // sequelize排序條件
  // sort => ex: 'id+desc,updatedAt+desc'
  // modelForSort => 用於欄位排序的 model
  async sorter({ sort, modelForSort }) {
    const columnAndOrderList = sort.split(','); // 例: ['id+asc', 'createdAt+desc']
    const newOrder = []; // 用於保存新的排序方式
    for (let columnAndOrderStr of columnAndOrderList) {
      columnAndOrderStr = columnAndOrderStr.trim();
      if (columnAndOrderStr.trim() === '') {
        continue;
      }

      const columnAndOrder = columnAndOrderStr.split(' '); // 例: ['id', 'asc']
      //
      // 檢查是否有欄位與排序方向
      //
      if (!columnAndOrder || columnAndOrder.length !== 2) {
        console.log('=== columnAndOrderStr error ===');
        throw Error(
          MESSAGE.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
            sort: columnAndOrderStr,
          })
        );
      }
      const columnStr = columnAndOrder[0].trim(); // 例: 'id'
      const orderStr = columnAndOrder[1].trim().toLocaleLowerCase(); // 例: 'asc'

      //
      // 檢查 model 是否有此欄位
      //
      if (!Object.keys(modelForSort.rawAttributes).includes(columnStr)) {
        console.log('=== columnAndOrderStr error ===');
        throw Error(
          MESSAGE.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
            sort: columnAndOrder[0],
          })
        );
      }

      //
      // 檢查排序方式是否為 asc 或 desc
      //
      if (!['asc', 'desc'].includes(orderStr)) {
        console.log('=== columnAndOrderStr error ===');
        throw Error(
          MESSAGE.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
            sort: columnAndOrder[1],
          })
        );
      }

      //
      // 增加新的排序方式
      //
      newOrder.push([columnStr, orderStr]);
    }

    //
    // 改為新的多欄位排序方式
    //
    if (newOrder && newOrder.length > 0) {
      return newOrder;
    }

    return null;
  },

  // 獲得分頁資訊
  async getPaging({ page, pageSize, count }) {
    const index = page - 1 >= 0 ? page - 1 : 0;
    const limit = pageSize >= 0 ? pageSize : 0;
    const totalCount = count;
    const totalPage = _.ceil(count / limit);

    return {
      page,
      pageSize,
      totalCount, // 資料庫中所有資料筆數
      totalPage, // 總共有幾頁
    };
  },
};

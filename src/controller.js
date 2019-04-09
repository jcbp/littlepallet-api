const dbConn = require('./db-conn');

module.exports = {
  async getLists() {
    try {
      const db = await dbConn.open();
      const lists = await db.collection('lists').find({}).toArray();
      dbConn.close();
      return lists;
    }
    catch (e) {
      throw new Error(e);
    }
  }
};
const dbConn = require('./db-conn');

module.exports = {
  async getLists(req, res) {
    try {
      const db = await dbConn.open();
      const lists = await db.collection('lists').find({}).toArray();
      dbConn.close();
      res.status(200).send(lists);
    }
    catch (error) {
      res.status(500).send(error);
    }
  }
};
const dbConn = require('./db-conn');

module.exports = {
  async getLists(req, res) {
    try {
      const db = await dbConn.open();
      const lists = await db.collection('lists').find({}).toArray();

      dbConn.close();
      res.status(200).send(lists);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
};
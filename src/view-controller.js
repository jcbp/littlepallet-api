const dbConn = require('./db-conn');
const ObjectID = require('mongodb').ObjectID;

module.exports = {
  async updateView(req, res) {
    console.log('updateView', req.params, req.body.name);
    try {
      const db = await dbConn.open();

      const updateData = Object.entries(req.body).reduce((data, prop) => {
        data['views.' + prop[0]] = prop[1];
        return data;
      }, {});

      const list = await db.collection('lists').findOneAndUpdate(
        { _id: ObjectID(req.params.id) },
        { $set: updateData },
        { returnOriginal: false }
      );

      dbConn.close();
      res.status(200).send(list.value.views);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
};
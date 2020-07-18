const dbConn = require('./db-conn');
const ObjectID = require('mongodb').ObjectID;

module.exports = {
  async getTemplates(req, res) {
    try {
      const db = await dbConn.open();

      const lists = await db.collection('lists').find({
        isTemplate: true
      }).project({
        name: 1,
        description: 1
      }).toArray();

      dbConn.close();
      res.status(200).send(lists);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },
  async createTemplate(req, res) {
    try {
      console.log('createTemplate', req.body);

      const db = await dbConn.open();

      const origin = await db.collection('lists').findOne({
        _id: ObjectID(req.params.listId)
      });

      const list = await db.collection('lists').insertOne({
        'name': req.body.name,
        'description': req.body.description,
        'isTemplate': true,
        'fieldLastIndex': origin.fieldLastIndex,
        'filterLastIndex': origin.filterLastIndex,
        'filters': origin.filters,
        'fields': origin.fields,
        'views': origin.views,
        'items': []
      });

      dbConn.close();
      res.status(200).send(list.ops.pop());
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
};
const dbConn = require('./db-conn');
const ObjectID = require('mongodb').ObjectID;

module.exports = {
  async getLists(req, res) {
    try {
      const db = await dbConn.open();
      const lists = await db.collection('lists').find({})
        .project({ name: 1 })
        .toArray();

      dbConn.close();
      res.status(200).send(lists);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  async getList(req, res) {
    try {
      const db = await dbConn.open();

      const list = await db.collection('lists').findOne({
        _id: ObjectID(req.params.id)
      });

      dbConn.close();
      res.status(200).send(list);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  async createList(req, res) {
    try {
      console.log('createList', req.body);

      const db = await dbConn.open();
      const list = await db.collection('lists').insertOne({
        'name': req.body.name,
        'fieldLastIndex': 0,
        'filterLastIndex': 0,
        'conditions': [],
        'filters': [],
        'fields': [],
        'items': []
      });

      dbConn.close();
      res.status(200).send(list.ops.pop());
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  async updateList(req, res) {
    console.log('updateList', req.params, req.body.name);
    try {
      const db = await dbConn.open();

      const list = await db.collection('lists').findOneAndUpdate(
        { _id: ObjectID(req.params.id) },
        { $set: { name: req.body.name } },
        { returnOriginal: false }
      );

      dbConn.close();
      res.status(200).send(list.value);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
};
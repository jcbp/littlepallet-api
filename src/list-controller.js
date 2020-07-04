const dbConn = require('./db-conn');
const ObjectID = require('mongodb').ObjectID;

module.exports = {
  async getLists(req, res) {
    try {
      const db = await dbConn.open();
      const lists = await db.collection('lists').find({
        $or: [ { isTemplate: { $exists: false } }, { isTemplate: false } ]
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
        'description': req.body.description,
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

  async createListFromTemplate(req, res) {
    try {
      console.log('createListFromTemplate', req.body);

      const db = await dbConn.open();

      const origin = await db.collection('lists').findOne({
        _id: ObjectID(req.params.id)
      });

      const list = await db.collection('lists').insertOne({
        'name': req.body.name,
        'description': req.body.description,
        'fieldLastIndex': origin.fieldLastIndex,
        'filterLastIndex': origin.filterLastIndex,
        'filters': origin.filters,
        'fields': origin.fields,
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

      const updateData = ['name'].reduce((data, prop) => {
        if(req.body[prop]) {
          data[prop] = req.body[prop];
        }
        return data;
      }, {});

      const list = await db.collection('lists').findOneAndUpdate(
        { _id: ObjectID(req.params.id) },
        { $set: updateData },
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
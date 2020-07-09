const dbConn = require('./db-conn');
const ObjectID = require('mongodb').ObjectID;

const cloneChildLists = async (db, name, origin) => {
  const childLists = [];

  await Promise.all(origin.childLists.map(async childList => {
    const childOrigin = await db.collection('lists').findOne({
      _id: ObjectID(childList['0'])
    });
    const list = await db.collection('lists').insertOne({
      'name': `${name} - ${childOrigin.name}`,
      'description': childOrigin.description,
      'fieldLastIndex': childOrigin.fieldLastIndex,
      'filterLastIndex': childOrigin.filterLastIndex,
      'filters': childOrigin.filters,
      'fields': childOrigin.fields,
      'items': []
    });
    childLists.push({
      _id: childList._id,
      '0': list.ops.pop()._id
    });
  }));

  return childLists;
};

module.exports = {
  async getLists(req, res) {
    try {
      const db = await dbConn.open();
      const lists = await db.collection('lists').find({
        $or: [ { isTemplate: { $exists: false } }, { isTemplate: false } ],
        status: { $ne: 'deleted' }
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

  async createListFromAnother(req, res) {
    try {
      console.log('createListFromAnother', req.body);

      const db = await dbConn.open();

      const origin = await db.collection('lists').findOne({
        _id: ObjectID(req.params.id)
      });

      const childLists = origin.childLists
        ? await cloneChildLists(db, req.body.name, origin)
        : [];

      const list = await db.collection('lists').insertOne({
        'name': req.body.name,
        'description': req.body.description,
        'fieldLastIndex': origin.fieldLastIndex,
        'filterLastIndex': origin.filterLastIndex,
        'filters': origin.filters,
        'fields': origin.fields,
        'childLists': childLists,
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

      const updateData = ['name', 'childLists', 'isTemplate', 'status'].reduce((data, prop) => {
        if(typeof req.body[prop] !== 'undefined') {
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
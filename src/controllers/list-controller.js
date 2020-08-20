const dbConn = require('../db-conn');
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
      'userLastIndex': childOrigin.userLastIndex,
      'filters': childOrigin.filters,
      'users': childOrigin.users,
      'fields': childOrigin.fields,
      'views': childOrigin.views,
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
    console.log('getLists');
    try {
      const db = await dbConn.open();
      const lists = await db.collection('lists').find({
        $or: [ { isTemplate: { $exists: false } }, { isTemplate: false } ],
        status: { $ne: 'deleted' },
        $or: [
          { owner: req.user.email },
          { users: { $elemMatch: { email: req.user.email } } }
        ]
      }).project({
        name: 1,
        description: 1,
        users: 1,
        owner: 1
      }).toArray();

      dbConn.close();
      res.status(200).send(lists);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  async getDeletedLists(req, res) {
    console.log('getDeletedLists');
    try {
      const db = await dbConn.open();
      const lists = await db.collection('lists').find({
        $or: [ { isTemplate: { $exists: false } }, { isTemplate: false } ],
        status: 'deleted',
        owner: req.user.email
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
    console.log('getList');
    try {
      const db = await dbConn.open();

      const list = await db.collection('lists').findOne({
        _id: ObjectID(req.params.id),
        $or: [
          { isTemplate: true },
          { owner: req.user.email },
          { users: { $elemMatch: { email: req.user.email } } }
        ],
      });

      dbConn.close();
      if(list) {
        res.status(200).send(list);
      }
      else {
        res.status(401).send({
          message: 'Resource does not exist or you do not have permissions'
        });
      }
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
        'owner': req.user.email,
        'description': req.body.description,
        'fieldLastIndex': 0,
        'filterLastIndex': 0,
        'userLastIndex': 0,
        'conditions': [],
        'filters': [],
        'users': [],
        'fields': [{ name: 'New field', type: 'text' }],
        'views': {},
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
        'owner': req.user.email,
        'description': req.body.description,
        'commentsEnabled': origin.commentsEnabled,
        'fieldLastIndex': origin.fieldLastIndex,
        'filterLastIndex': origin.filterLastIndex,
        'userLastIndex': origin.userLastIndex,
        'filters': origin.filters,
        'users': origin.users,
        'fields': origin.fields,
        'views': origin.views,
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

      const updateData = [
        'name',
        'childLists',
        'isTemplate',
        'status',
        'category',
        'commentsEnabled'
      ].reduce((data, prop) => {
        if(typeof req.body[prop] !== 'undefined') {
          data[prop] = req.body[prop];
        }
        return data;
      }, {});

      const list = await db.collection('lists').findOneAndUpdate(
        {
          _id: ObjectID(req.params.id),
          $or: [
            { owner: req.user.email },
            { users: {
                $elemMatch: {
                  email: req.user.email,
                  role: { $in: [ 'writer', 'organizer' ] }
                }
              }
            }
          ]
        },
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
  },

  async deleteList(req, res) {
    console.log('deleteList', req.params, req.body.name);
    try {
      const db = await dbConn.open();

      const list = await db.collection('lists').deleteOne({
        _id: ObjectID(req.params.id),
        owner: req.user.email
      });

      dbConn.close();
      res.status(200).send({ _id: req.params.id });
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

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
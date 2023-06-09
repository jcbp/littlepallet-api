const dbConn = require('../db-conn');
const ObjectID = require('mongodb').ObjectID;

const cloneChildLists = async (current, origin) => {
  const childLists = [];

  await Promise.all(origin.childLists.map(async childList => {
    const childOrigin = await dbConn.getCollection('lists').findOne({
      _id: ObjectID(childList['0'])
    });
    const list = await dbConn.getCollection('lists').insertOne({
      'name': childOrigin.name,
      'isChildList': true,
      'owner': current.email,
      'description': childOrigin.description,
      'fieldLastIndex': childOrigin.fieldLastIndex,
      'filterLastIndex': childOrigin.filterLastIndex,
      'userLastIndex': 0,
      'filters': childOrigin.filters,
      'users': [],
      'fields': childOrigin.fields,
      'views': childOrigin.views,
      'items': [],
      'tags': `${current.name},${childOrigin.name}`
    });
    childLists.push({
      _id: childList._id,
      '0': list.ops.pop()._id
    });
  }));

  return childLists;
};

const mergeArrayOfObjects = (arrayA, arrayB, prop) => {
  return arrayA.map(itemA => {
    const itemB = arrayB.find(item => {
      return item[prop] == itemA[prop];
    });
    return Object.assign(itemA, itemB);
  });
};

const listController = {
  async getLists(req, res) {
    console.log('getLists');
    try {
      const lists = await dbConn.getCollection('lists').find({
        $and: [
          { $or: [ { isTemplate: { $exists: false } }, { isTemplate: false } ] },
          { $or: [ { isChildList: { $exists: false } }, { isChildList: false } ] },
        ],
        status: { $ne: 'deleted' },
        $or: [
          { owner: req.user.email },
          { users: { $elemMatch: { email: req.user.email } } }
        ]
      }).project({
        name: 1,
        description: 1,
        users: 1,
        owner: 1,
        tags: 1,
        updatedAt: 1,
      }).toArray();

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
      const lists = await dbConn.getCollection('lists').find({
        $or: [ { isTemplate: { $exists: false } }, { isTemplate: false } ],
        status: 'deleted',
        owner: req.user.email
      }).project({
        name: 1,
        description: 1
      }).toArray();

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
      const list = await dbConn.getCollection('lists').findOne({
        _id: ObjectID(req.params.id),
        $or: [
          { isTemplate: true },
          { owner: req.user.email },
          { users: { $elemMatch: { email: req.user.email } } }
        ],
      });
      
      const emails = (list.users || []).map(user => user.email);

      const users = await dbConn.getCollection('users').find({
        email: { $in: emails }
      }).project({
        _id: 0,
        name: 1,
        email: 1
      }).toArray();

      list.users = mergeArrayOfObjects(list.users || [], users, 'email');

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

  async getListConfig(req, res) {
    console.log('getListConfig');
    try {
      const list = await dbConn.getCollection('lists').findOne({
        _id: ObjectID(req.params.id),
        $or: [
          { isTemplate: true },
          { owner: req.user.email },
          { users: { $elemMatch: { email: req.user.email } } }
        ],
      });

      delete list.items;
      
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

      const list = await dbConn.getCollection('lists').insertOne({
        'name': req.body.name,
        'owner': req.user.email,
        'description': req.body.description,
        'fieldLastIndex': 0,
        'filterLastIndex': 0,
        'userLastIndex': 0,
        'conditions': [],
        'filters': [],
        'users': [],
        'fields': [{ _id: 0, name: 'New field', type: 'text' }],
        'views': {},
        'items': [],
        'status': 'active', // active | deleted | archived
      });

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

      const origin = await dbConn.getCollection('lists').findOne({
        _id: ObjectID(req.params.id)
      });

      const childLists = origin.childLists
        ? await cloneChildLists({
            name: req.body.name,
            email: req.user.email
          },
          origin
        )
        : [];

      const list = await dbConn.getCollection('lists').insertOne({
        'name': req.body.name,
        'owner': req.user.email,
        'description': req.body.description,
        'commentsEnabled': origin.commentsEnabled,
        'fieldLastIndex': origin.fieldLastIndex,
        'filterLastIndex': origin.filterLastIndex,
        'userLastIndex': 0,
        'filters': origin.filters,
        'users': [],
        'fields': origin.fields,
        'views': origin.views,
        'childLists': childLists,
        'items': []
      });

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
      const updateData = [
        'name',
        'tags',
        'childLists',
        'isTemplate',
        'lang',
        'category',
        'commentsEnabled'
      ].reduce((data, prop) => {
        if(typeof req.body[prop] !== 'undefined') {
          data[prop] = req.body[prop];
        }
        return data;
      }, {});

      const list = await dbConn.getCollection('lists').findOneAndUpdate(
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

      if(!list.value) {
        throw {message: 'List does not exist or you have no permissions'};
      }

      if(res) {
        res.status(200).send(list.value);
      }
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  async softDeleteList(req, res) {
    try {
      const list = await dbConn.getCollection('lists').findOne({
        _id: ObjectID(req.params.id)
      });

      if (!list) {
        throw { message: 'List does not exist' };
      }

      if (req.user.email === list.owner) {
        // El usuario actual es el propietario de la lista
        const updatedList = await dbConn.getCollection('lists').findOneAndUpdate(
          { _id: ObjectID(req.params.id) },
          { $set: { status: 'deleted' } },
          { returnOriginal: false }
        );

        res.status(200).send(updatedList.value);
      } else if (list.users.some(user => user.email === req.user.email)) {
        // El usuario actual está en la lista de usuarios
        const updatedList = await dbConn.getCollection('lists').findOneAndUpdate(
          { _id: ObjectID(req.params.id) },
          { $pull: { users: { email: req.user.email } } },
          { returnOriginal: false }
        );

        res.status(200).send(updatedList.value);
      } else {
        throw { message: 'You have no permissions to delete this list' };
      }
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  async hardDeleteList(req, res) {
    console.log('deleteList', req.params, req.body.name);
    try {
      const list = await dbConn.getCollection('lists').deleteOne({
        _id: ObjectID(req.params.id),
        owner: req.user.email
      });

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
      const updateData = Object.entries(req.body).reduce((data, prop) => {
        data['views.' + prop[0]] = prop[1];
        return data;
      }, {});

      const list = await dbConn.getCollection('lists').findOneAndUpdate(
        { _id: ObjectID(req.params.id) },
        { $set: updateData },
        { returnOriginal: false }
      );

      res.status(200).send(list.value.views);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
};
module.exports = listController;
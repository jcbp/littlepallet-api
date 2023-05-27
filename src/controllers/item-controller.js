const dbConn = require('../db-conn');
const ObjectID = require('mongodb').ObjectID;

const deleteItem = async (listId, itemId, user) => {
  const list = await dbConn.getCollection('lists').findOneAndUpdate(
    {
      _id: ObjectID(listId),
      $or: [
        { owner: user.email },
        { users: { $elemMatch: { email: user.email } } }
      ]
    },
    { $pull: { items: { _id: itemId } } },
    { returnOriginal: true }
  );

  return list.value.items.find(item => item._id === itemId);
};

const createItemAtPosition = async (listId, item, user, position) => {
  position = parseInt(position);

  const list = await dbConn.getCollection('lists').findOneAndUpdate(
    {
      _id: ObjectID(listId),
      $or: [
        { owner: user.email },
        { users: { $elemMatch: { email: user.email } } }
      ]
    },
    { $push: { 'items': { $each: [ item ], $position: position } } },
    { returnOriginal: false }
  );
  return list.value.items[position];
};

const createItemId = async (listId, userEmail) => {
  const list = await dbConn.getCollection('lists').findOne(
    {
      _id: ObjectID(listId),
      $or: [
        { owner: userEmail },
        { users: { $elemMatch: { email: userEmail } } }
      ]
    },
    { items: 1 }
  );
  const newItemId = (
    Math.max.apply(
      null,
      [-1, ...list.items.map(item => parseInt(item._id))]
    ) + 1
  ).toString();
  console.log('newItemId', newItemId)
  return newItemId;
};

module.exports = {
  async createItem(req, res) {
    console.log('createItem', req.params, req.body);

    const newItemId = await createItemId(
      req.params.id,
      req.user.email
    );
    const newItem = { ...req.body, _id: newItemId };

    try {
      await dbConn.getCollection('lists').updateOne(
        {
          _id: ObjectID(req.params.id),
          $or: [
            { owner: req.user.email },
            { users: { $elemMatch: { email: req.user.email } } }
          ]
        },
        { $push: { 'items': newItem } }
      );

      const list = await dbConn.getCollection('lists').aggregate([
        { $match: { _id: ObjectID(req.params.id) } },
        { $project: { _id: 0, item: { $arrayElemAt: ['$items', -1] } } }
      ]).toArray();

      res.status(200).send(list[0].item);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  async createItemAtPosition(req, res) {
    console.log('createItemAtPosition', req.params, req.body);
    try {
      const item = await createItemAtPosition(
        req.params.id,
        req.body,
        req.user,
        req.params.position
      );
      res.status(200).send(item);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  async moveItemAtPosition(req, res) {
    console.log('moveItemAtPosition', req.params, req.body);
    try {
      let relocatedItem;
      await dbConn.withTransaction(async () => {
        const itemToMove = await deleteItem(
          req.params.listId,
          req.params.itemId,
          req.user
        );
        relocatedItem = await createItemAtPosition(
          req.params.listId,
          itemToMove,
          req.user,
          req.params.position
        );
      });
      res.status(200).send(relocatedItem);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  async updateItem(req, res) {
    console.log('updateItem', req.params, req.body);
    try {
      await dbConn.getCollection('lists').updateOne(
        {
          _id: ObjectID(req.params.listId),
          $or: [
            { owner: req.user.email },
            { users: { $elemMatch: { email: req.user.email } } }
          ]
        },
        { $set: { 'items.$[item]': req.body } },
        { arrayFilters: [ { 'item._id': req.params.itemId } ] }
      );

      const list = await dbConn.getCollection('lists').find({
        _id: ObjectID(req.params.listId),
      }).project({
        _id: 0,
        items: { $elemMatch: { _id: req.params.itemId } }
      }).toArray();

      res.status(200).send(list[0].items[0]);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },
  
  async updateItemField(req, res) {
    console.log('updateItemField', req.params, req.body);
    try {
      const now = new Date();
      await dbConn.getCollection('lists').updateOne(
        {
          _id: ObjectID(req.params.listId),
          $or: [
            { owner: req.user.email },
            { users: { $elemMatch: { email: req.user.email } } }
          ]
        },
        {
          $set: {
            [`items.$[item].${req.params.fieldId}`]: req.body.value,
            updatedAt: now,
          }
        },
        {
          arrayFilters: [{ "item._id": req.params.itemId }]
        }
      );

      const list = await dbConn.getCollection('lists').find({
        _id: ObjectID(req.params.listId),
      }).project({
        _id: 0,
        items: { $elemMatch: { _id: req.params.itemId } }
      }).toArray();

      res.status(200).send(list[0].items[0]);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  async deleteItem(req, res) {
    console.log('deleteItem', req.params, req.body);
    try {
      const item = await deleteItem(
        req.params.listId,
        req.params.itemId,
        req.user
      );
      res.status(200).send(item);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
};
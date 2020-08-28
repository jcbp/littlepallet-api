
const dbConn = require('../db-conn');
const ObjectID = require('mongodb').ObjectID;

module.exports = {
  async createItem(req, res) {
    console.log('createItem', req.params, req.body);
    if(typeof req.body._id !== 'string') {
      res.status(500).send({
        message: '_id must be a string'
      });
      return;
    }

    try {
      await dbConn.getCollection('lists').updateOne(
        {
          _id: ObjectID(req.params.id),
          $or: [
            { owner: req.user.email },
            { users: { $elemMatch: { email: req.user.email } } }
          ]
        },
        { $push: { 'items': req.body } }
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
      const position = parseInt(req.params.position);

      await dbConn.getCollection('lists').updateOne(
        {
          _id: ObjectID(req.params.id),
          $or: [
            { owner: req.user.email },
            { users: { $elemMatch: { email: req.user.email } } }
          ]
        },
        { $push: { 'items': { $each: [ req.body ], $position: position } } }
      );

      const list = await dbConn.getCollection('lists').aggregate([
        { $match: { _id: ObjectID(req.params.id) } },
        { $project: { _id: 0, item: { $arrayElemAt: ['$items', position] } } }
      ]).toArray();

      res.status(200).send(list[0].item);
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
      await dbConn.getCollection('lists').updateOne(
        {
          _id: ObjectID(req.params.listId),
          $or: [
            { owner: req.user.email },
            { users: { $elemMatch: { email: req.user.email } } }
          ]
        },
        { $set: { [`items.$[item].${req.params.fieldId}`]: req.body.value } },
        { arrayFilters: [ { 'item._id': req.params.itemId } ] }
      );

      const list = await dbConn.getCollection('lists').find({
        _id: ObjectID(req.params.listId),
      }).project({
        _id: 0,
        items: { $elemMatch: { _id: req.params.itemId } }
      }).toArray();

      res.status(200).send(list[0].items);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  async deleteItem(req, res) {
    console.log('deleteItem', req.params, req.body);
    try {
      const list = await dbConn.getCollection('lists').find({
        _id: ObjectID(req.params.listId),
        $or: [
          { owner: req.user.email },
          { users: { $elemMatch: { email: req.user.email } } }
        ]
      }).project({
        _id: 0,
        items: { $elemMatch: { _id: req.params.itemId } }
      }).toArray();

      await dbConn.getCollection('lists').updateOne(
        { _id: ObjectID(req.params.listId) },
        { $pull: { items: { _id: req.params.itemId } } }
      );

      const items = list.pop().items;
      res.status(200).send(items ? items.pop() : {});
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
};
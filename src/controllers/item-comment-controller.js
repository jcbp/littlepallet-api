
const dbConn = require('../db-conn');
const ObjectID = require('mongodb').ObjectID;

module.exports = {
  async createComment(req, res) {
    console.log('createComment', req.params, req.body);

    try {
      const db = await dbConn.open();

      await db.collection('lists').updateOne(
        { _id: ObjectID(req.params.listId) },
        { $push: { 'items.$[item].comments': req.body } },
        { arrayFilters: [ { 'item._id': req.params.itemId } ] }
      );

      const list = await db.collection('lists').find({
        _id: ObjectID(req.params.listId),
      }).project({
        _id: 0,
        items: { $elemMatch: { _id: req.params.itemId } }
      }).toArray();

      dbConn.close();
      res.status(200).send(list[0].items[0].comments.pop());
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  async updateItem(req, res) {
    console.log('updateItem', req.params, req.body);
    try {
      const db = await dbConn.open();

      await db.collection('lists').updateOne(
        { _id: ObjectID(req.params.listId) },
        { $set: { 'items.$[item]': req.body } },
        { arrayFilters: [ { 'item._id': req.params.itemId } ] }
      );

      const list = await db.collection('lists').find({
        _id: ObjectID(req.params.listId),
      }).project({
        _id: 0,
        items: { $elemMatch: { _id: req.params.itemId } }
      }).toArray();

      dbConn.close();
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
      const db = await dbConn.open();

      await db.collection('lists').updateOne(
        { _id: ObjectID(req.params.listId) },
        { $set: { [`items.$[item].${req.params.fieldId}`]: req.body.value } },
        { arrayFilters: [ { 'item._id': req.params.itemId } ] }
      );

      const list = await db.collection('lists').find({
        _id: ObjectID(req.params.listId),
      }).project({
        _id: 0,
        items: { $elemMatch: { _id: req.params.itemId } }
      }).toArray();

      dbConn.close();
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
      const db = await dbConn.open();

      const list = await db.collection('lists').find({
        _id: ObjectID(req.params.listId),
      }).project({
        _id: 0,
        items: { $elemMatch: { _id: req.params.itemId } }
      }).toArray();

      await db.collection('lists').updateOne(
        { _id: ObjectID(req.params.listId) },
        { $pull: { items: { _id: req.params.itemId } } }
      );

      dbConn.close();

      const items = list.pop().items;
      res.status(200).send(items ? items.pop() : {});
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
};
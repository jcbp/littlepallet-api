const dbConn = require('../db-conn');
const ObjectID = require('mongodb').ObjectID;

const getNextFilterIndex = async (db, listId) => {
    await db.collection('lists').updateOne(
      { _id: ObjectID(listId) },
      { $inc: { filterLastIndex: 1 } }
    );

    const list = await db.collection('lists').find({
      _id: ObjectID(listId),
    }).project({
      _id: 0,
      filterLastIndex: 1
    }).toArray();

    return list.pop().filterLastIndex;
};

module.exports = {
  async createFilter(req, res) {
    console.log('createFilter', req.params, req.body);
    try {
      const db = await dbConn.open();

      req.body._id = await getNextFilterIndex(db, req.params.id);
      
      await db.collection('lists').updateOne(
        { _id: ObjectID(req.params.id) },
        { $push: { 'filters': req.body } }
      );

      const list = await db.collection('lists').aggregate([
        { $match: { _id: ObjectID(req.params.id) } },
        { $project: { _id: 0, filter: { $arrayElemAt: ['$filters', -1] } } }
      ]).toArray();

      dbConn.close();
      res.status(200).send(list.pop().filter);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  async createFieldAtPosition(req, res) {
    console.log('createFieldAtPosition', req.params, req.body);
    try {
      const db = await dbConn.open();
      const position = parseInt(req.params.position);

      req.body._id = await getNextFilterIndex(db, req.params.id);

      await db.collection('lists').updateOne(
        { _id: ObjectID(req.params.id) },
        { $push: { 'fields': { $each: [ req.body ], $position: position } } }
      );

      const list = await db.collection('lists').aggregate([
        { $match: { _id: ObjectID(req.params.id) } },
        { $project: { _id: 0, field: { $arrayElemAt: ['$fields', position] } } }
      ]).toArray();

      dbConn.close();
      res.status(200).send(list[0].field);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },
  
  async updateFilter(req, res) {
    console.log('updateFilter', req.params, req.body);
    try {
      const filterId = parseInt(req.params.filterId);
      const db = await dbConn.open();

      await db.collection('lists').updateOne(
        { _id: ObjectID(req.params.listId) },
        { $set: { [`filters.$[filter].${req.body.attr}`]: req.body.value } },
        { arrayFilters: [ { 'filter._id': filterId } ] }
      );

      const list = await db.collection('lists').find({
        _id: ObjectID(req.params.listId),
      }).project({
        _id: 0,
        filters: { $elemMatch: { _id: filterId } }
      }).toArray();

      dbConn.close();
      res.status(200).send(list[0].filters && list[0].filters[0]);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  async deleteField(req, res) {
    console.log('deleteField', req.params, req.body);
    try {
      const fieldId = parseInt(req.params.fieldId);
      const db = await dbConn.open();

      await db.collection('lists').updateOne(
        { _id: ObjectID(req.params.listId) },
        { $pull: { fields: { _id: fieldId } } }
      );

      const fields = await db.collection('lists').find({
        _id: ObjectID(req.params.listId),
      }).project({
        _id: 0,
        fields: 1
      }).toArray();

      dbConn.close();
      res.status(200).send(fields.pop().fields);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
};
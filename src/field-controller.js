const dbConn = require('./db-conn');
const ObjectID = require('mongodb').ObjectID;

const getNextFieldIndex = async (db, listId) => {
    await db.collection('lists').updateOne(
      { _id: ObjectID(listId) },
      { $inc: { fieldLastIndex: 1 } }
    );

    const list = await db.collection('lists').find({
      _id: ObjectID(listId),
    }).project({
      _id: 0,
      fieldLastIndex: 1
    }).toArray();

    return list.pop().fieldLastIndex;
};

module.exports = {
  async createField(req, res) {
    console.log('createField', req.params, req.body);
    try {
      const db = await dbConn.open();

      req.body._id = await getNextFieldIndex(db, req.params.id);
      
      await db.collection('lists').updateOne(
        { _id: ObjectID(req.params.id) },
        { $push: { 'fields': req.body } }
      );

      const list = await db.collection('lists').aggregate([
        { $match: { _id: ObjectID(req.params.id) } },
        { $project: { _id: 0, field: { $arrayElemAt: ['$fields', -1] } } }
      ]).toArray();

      dbConn.close();
      res.status(200).send(list[0].field);
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

      req.body._id = await getNextFieldIndex(db, req.params.id);

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
  
  async updateField(req, res) {
    console.log('updateField', req.params, req.body);
    try {
      const fieldId = parseInt(req.params.fieldId);
      const db = await dbConn.open();

      await db.collection('lists').updateOne(
        { _id: ObjectID(req.params.listId) },
        { $set: { [`fields.$[field].${req.body.attr}`]: req.body.value } },
        { arrayFilters: [ { 'field._id': fieldId } ] }
      );

      const list = await db.collection('lists').find({
        _id: ObjectID(req.params.listId),
      }).project({
        _id: 0,
        fields: { $elemMatch: { _id: fieldId } }
      }).toArray();

      dbConn.close();
      res.status(200).send(list[0].fields && list[0].fields[0]);
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
const dbConn = require('../db-conn');
const ObjectID = require('mongodb').ObjectID;

const getNextFieldIndex = async (listId) => {
    const list = await dbConn.getCollection('lists').findOneAndUpdate(
      { _id: ObjectID(listId) },
      { $inc: { fieldLastIndex: 1 } },
      { returnOriginal: false }
    );
    return list.value.fieldLastIndex;
};

const deleteField = async (listId, fieldId, user) => {
  fieldId = parseInt(fieldId);

  const list = await dbConn.getCollection('lists').findOneAndUpdate(
    {
      _id: ObjectID(listId),
      $or: [
        { owner: user.email },
        { users: { $elemMatch: { email: user.email } } }
      ]
    },
    { $pull: { fields: { _id: fieldId } } },
    { returnOriginal: true }
  );
  console.log(list.value.fields.find(field => field._id === fieldId));

  return list.value.fields.find(field => field._id === fieldId);
};

const createFieldAtPosition = async (listId, field, user, position) => {
  position = parseInt(position);

  if(!field._id) {
    field._id = await getNextFieldIndex(listId);
  }

  const list = await dbConn.getCollection('lists').findOneAndUpdate(
    {
      _id: ObjectID(listId),
      $or: [
        { owner: user.email },
        { users: { $elemMatch: { email: user.email } } }
      ]
    },
    { $push: { 'fields': { $each: [ field ], $position: position } } },
    { returnOriginal: false }
  );

  return list.value.fields[position];
};

module.exports = {
  async createField(req, res) {
    console.log('createField', req.params, req.body);
    try {
      req.body._id = await getNextFieldIndex(req.params.id);
      
      await dbConn.getCollection('lists').updateOne(
        {
          _id: ObjectID(req.params.id),
          $or: [
            { owner: req.user.email },
            { users: { $elemMatch: { email: req.user.email } } }
          ]
        },
        { $push: { 'fields': req.body } }
      );

      const list = await dbConn.getCollection('lists').aggregate([
        { $match: { _id: ObjectID(req.params.id) } },
        { $project: { _id: 0, field: { $arrayElemAt: ['$fields', -1] } } }
      ]).toArray();

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
      const field = await createFieldAtPosition(
        req.params.id,
        req.body,
        req.user,
        req.params.position
      );
      res.status(200).send(field);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  async moveFieldAtPosition(req, res) {
    console.log('moveFieldAtPosition', req.params, req.body);
    try {
      let relocatedField;
      await dbConn.withTransaction(async () => {
        const fieldToMove = await deleteField(
          req.params.listId,
          req.params.fieldId,
          req.user
        );
        relocatedField = await createFieldAtPosition(
          req.params.listId,
          fieldToMove,
          req.user,
          req.params.position
        );
      });
      res.status(200).send(relocatedField);
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

      await dbConn.getCollection('lists').updateOne(
        {
          _id: ObjectID(req.params.listId),
          $or: [
            { owner: req.user.email },
            { users: { $elemMatch: { email: req.user.email } } }
          ]
        },
        { $set: { [`fields.$[field].${req.body.attr}`]: req.body.value } },
        { arrayFilters: [ { 'field._id': fieldId } ] }
      );

      const list = await dbConn.getCollection('lists').find({
        _id: ObjectID(req.params.listId),
      }).project({
        _id: 0,
        fields: { $elemMatch: { _id: fieldId } }
      }).toArray();

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
      const field = await deleteField(
        req.params.listId,
        req.params.fieldId,
        req.user
      );
      res.status(200).send(field);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
};
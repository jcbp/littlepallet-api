const dbConn = require('../db-conn');
const ObjectID = require('mongodb').ObjectID;

const getNextFilterIndex = async (listId) => {
    const list = await dbConn.getCollection('lists').findOneAndUpdate(
      { _id: ObjectID(listId) },
      { $inc: { filterLastIndex: 1 } },
      { returnOriginal: false }
    );
    return list.value.filterLastIndex;
};

const deleteFilter = async (listId, filterId, user) => {
  filterId = parseInt(filterId);

  const list = await dbConn.getCollection('lists').findOneAndUpdate(
    {
      _id: ObjectID(listId),
      $or: [
        { owner: user.email },
        { users: { $elemMatch: { email: user.email } } }
      ]
    },
    { $pull: { filters: { _id: filterId } } },
    { returnOriginal: true }
  );

  return list.value.filters.find(filter => filter._id === filterId);
};

const createFilterAtPosition = async (listId, filter, user, position) => {
  position = parseInt(position);

  if(!filter._id) {
    filter._id = await getNextFilterIndex(listId);
  }

  const list = await dbConn.getCollection('lists').findOneAndUpdate(
    {
      _id: ObjectID(listId),
      $or: [
        { owner: user.email },
        { users: { $elemMatch: { email: user.email } } }
      ]
    },
    { $push: { 'filters': { $each: [ filter ], $position: position } } },
    { returnOriginal: false }
  );

  return list.value.filters[position];
};

module.exports = {
  async createFilter(req, res) {
    console.log('createFilter', req.params, req.body);
    try {
      req.body._id = await getNextFilterIndex(req.params.id);
      
      await dbConn.getCollection('lists').updateOne(
        { _id: ObjectID(req.params.id) },
        { $push: { 'filters': req.body } }
      );

      const list = await dbConn.getCollection('lists').aggregate([
        { $match: { _id: ObjectID(req.params.id) } },
        { $project: { _id: 0, filter: { $arrayElemAt: ['$filters', -1] } } }
      ]).toArray();

      res.status(200).send(list.pop().filter);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  async createFilterAtPosition(req, res) {
    console.log('createFilterAtPosition', req.params, req.body);
    try {
      const filter = await createFilterAtPosition(
        req.params.id,
        req.body,
        req.user,
        req.params.position
      );
      res.status(200).send(filter);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  async moveFilterAtPosition(req, res) {
    console.log('moveFilterAtPosition', req.params, req.body);
    try {
      let relocatedFilter;
      await dbConn.withTransaction(async () => {
        const filterToMove = await deleteFilter(
          req.params.listId,
          req.params.filterId,
          req.user
        );
        relocatedFilter = await createFilterAtPosition(
          req.params.listId,
          filterToMove,
          req.user,
          req.params.position
        );
      });
      res.status(200).send(relocatedFilter);
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

      await dbConn.getCollection('lists').updateOne(
        { _id: ObjectID(req.params.listId) },
        { $set: { [`filters.$[filter].${req.body.attr}`]: req.body.value } },
        { arrayFilters: [ { 'filter._id': filterId } ] }
      );

      const list = await dbConn.getCollection('lists').find({
        _id: ObjectID(req.params.listId),
      }).project({
        _id: 0,
        filters: { $elemMatch: { _id: filterId } }
      }).toArray();

      res.status(200).send(list[0].filters && list[0].filters[0]);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  async deleteFilter(req, res) {
    console.log('deleteFilter', req.params, req.body);
    try {
      const filter = await deleteFilter(
        req.params.listId,
        req.params.filterId,
        req.user
      );
      res.status(200).send(filter);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
};
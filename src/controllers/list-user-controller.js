const dbConn = require('../db-conn');
const ObjectID = require('mongodb').ObjectID;

const getNextUserIndex = async (listId) => {
    await dbConn.getCollection('lists').updateOne(
      { _id: ObjectID(listId) },
      { $inc: { userLastIndex: 1 } }
    );

    const list = await dbConn.getCollection('lists').find({
      _id: ObjectID(listId),
    }).project({
      _id: 0,
      userLastIndex: 1
    }).toArray();

    return list.pop().userLastIndex;
};

module.exports = {
  async addUser(req, res) {
    console.log('addUser', req.params, req.body);
    try {
      req.body._id = await getNextUserIndex(req.params.id);
      
      await dbConn.getCollection('lists').updateOne(
        { _id: ObjectID(req.params.id) },
        { $push: { 'users': req.body } }
      );

      const list = await dbConn.getCollection('lists').aggregate([
        { $match: { _id: ObjectID(req.params.id) } },
        { $project: { _id: 0, user: { $arrayElemAt: ['$users', -1] } } }
      ]).toArray();

      res.status(200).send(list.pop().user);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  async updateUser(req, res) {
    console.log('updateUser', req.params, req.body);
    try {
      const userId = parseInt(req.params.userId);

      await dbConn.getCollection('lists').updateOne(
        { _id: ObjectID(req.params.listId) },
        { $set: { [`users.$[user].${req.body.attr}`]: req.body.value } },
        { arrayFilters: [ { 'user._id': userId } ] }
      );

      const list = await dbConn.getCollection('lists').find({
        _id: ObjectID(req.params.listId),
      }).project({
        _id: 0,
        users: { $elemMatch: { _id: userId } }
      }).toArray();

      res.status(200).send(list[0].users && list[0].users[0]);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  async deleteUser(req, res) {
    console.log('deleteUser', req.params, req.body);
    try {
      const userId = parseInt(req.params.userId);

      const list = await dbConn.getCollection('lists').findOne({
        _id: ObjectID(req.params.listId)
      });
      const user = list.users.find(user => user._id === userId);

      await dbConn.getCollection('lists').updateOne(
        { _id: ObjectID(req.params.listId) },
        { $pull: { users: { _id: userId } } }
      );

      res.status(200).send(user);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
};
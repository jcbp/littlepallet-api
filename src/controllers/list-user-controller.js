const dbConn = require('../db-conn');
const ObjectID = require('mongodb').ObjectID;

const getNextUserIndex = async (db, listId) => {
    await db.collection('lists').updateOne(
      { _id: ObjectID(listId) },
      { $inc: { userLastIndex: 1 } }
    );

    const list = await db.collection('lists').find({
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
      const db = await dbConn.open();

      req.body._id = await getNextUserIndex(db, req.params.id);
      
      await db.collection('lists').updateOne(
        { _id: ObjectID(req.params.id) },
        { $push: { 'users': req.body } }
      );

      const list = await db.collection('lists').aggregate([
        { $match: { _id: ObjectID(req.params.id) } },
        { $project: { _id: 0, user: { $arrayElemAt: ['$users', -1] } } }
      ]).toArray();

      dbConn.close();
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
      const db = await dbConn.open();

      await db.collection('lists').updateOne(
        { _id: ObjectID(req.params.listId) },
        { $set: { [`users.$[user].${req.body.attr}`]: req.body.value } },
        { arrayUsers: [ { 'user._id': userId } ] }
      );

      const list = await db.collection('lists').find({
        _id: ObjectID(req.params.listId),
      }).project({
        _id: 0,
        users: { $elemMatch: { _id: userId } }
      }).toArray();

      dbConn.close();
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
      const db = await dbConn.open();

      await db.collection('lists').updateOne(
        { _id: ObjectID(req.params.listId) },
        { $pull: { users: { _id: userId } } }
      );

      const users = await db.collection('lists').find({
        _id: ObjectID(req.params.listId),
      }).project({
        _id: 0,
        users: 1
      }).toArray();

      dbConn.close();
      res.status(200).send(users.pop().users);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
};
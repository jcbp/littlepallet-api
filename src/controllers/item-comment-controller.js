const dbConn = require('../db-conn');
const ObjectID = require('mongodb').ObjectID;

module.exports = {
  async createComment(req, res) {

    let comment;
    if(req.file) {
      console.log('create image comment', req.params, req.body);
      comment = {
        image: req.file.filename,
        date: parseInt(req.body.date),
        user: {
          email: req.body.userEmail,
          name: req.body.userName,
          _id: req.body.userId
        }
      };
      req.body.image = req.file.path;
    }
    else {
      console.log('create text comment', req.params, req.body);
      comment = req.body;
    }

    try {
      await dbConn.getCollection('lists').updateOne(
        { _id: ObjectID(req.params.listId) },
        { $push: { 'items.$[item].comments': comment } },
        { arrayFilters: [ { 'item._id': req.params.itemId } ] }
      );

      const list = await dbConn.getCollection('lists').find({
        _id: ObjectID(req.params.listId),
      }).project({
        _id: 0,
        items: { $elemMatch: { _id: req.params.itemId } }
      }).toArray();

      res.status(200).send(list[0].items[0].comments.pop());
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
};
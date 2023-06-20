const dbConn = require('../db-conn');
const ObjectID = require('mongodb').ObjectID;

module.exports = {
  async getTemplates(req, res) {
    console.log('getTemplates', req.params);
    try {
      const lists = await dbConn.getCollection('lists').find({
        isTemplate: true,
        lang: req.params.lang,
        $or: [{ isChildList: { $exists: false } }, { isChildList: false }],
      }).project({
        name: 1,
        description: 1,
        category: 1
      }).toArray();

      res.status(200).send(lists);
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },
  async createTemplate(req, res) {
    try {
      console.log('createTemplate', req.body);

      const origin = await dbConn.getCollection('lists').findOne({
        _id: ObjectID(req.params.listId)
      });

      const list = await dbConn.getCollection('lists').insertOne({
        'name': req.body.name,
        'description': req.body.description,
        'isTemplate': true,
        'fieldLastIndex': origin.fieldLastIndex,
        'filterLastIndex': origin.filterLastIndex,
        'filters': origin.filters,
        'fields': origin.fields,
        'views': origin.views,
        'items': []
      });

      res.status(200).send(list.ops.pop());
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
};
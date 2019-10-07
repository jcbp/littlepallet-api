const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';

let client;

module.exports = {
  async open() {
    try {
      client = await MongoClient.connect(url, {useNewUrlParser: true});
      const db = client.db('watercoon');

      console.log('DB connection opened');
      return db;
    }
    catch(err) {
      throw new Error('Error connecting to DB', err);
    }
  },
  close() {
    client.close();
    console.log('DB connection closed');
  }
};
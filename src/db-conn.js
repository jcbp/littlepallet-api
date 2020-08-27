const MongoClient = require('mongodb').MongoClient;

const url = process.env.NODE_ENV === 'development'
  ? 'mongodb://localhost:27017'
  : 'mongodb+srv://adminDbUser:Np8lc88rTrNXNUDQ@cluster0.adroc.mongodb.net/littlepallet?retryWrites=true&w=majority';

let client;
let db;

module.exports = {
  async connect() {
    try {
      client = await MongoClient.connect(url, {
        useNewUrlParser: true,
        // retry to connect for 60 times
        reconnectTries: 60,
        // wait 1 second before retrying
        reconnectInterval: 1000
      });
      db = client.db('littlepallet');

      console.log('DB connection opened');
    }
    catch(err) {
      throw new Error('Error connecting to DB', err);
    }
  },
  async close() {
    await client.close();
    console.log('DB connection closed');
  },
  getDb() {
    return db;
  },
  getCollection(collectionName) {
    return db.collection(collectionName);
  }
};
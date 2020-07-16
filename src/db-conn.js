const MongoClient = require('mongodb').MongoClient;

const url = process.env.NODE_ENV === 'development'
  ? 'mongodb://localhost:27017'
  : 'mongodb+srv://adminDbUser:Np8lc88rTrNXNUDQ@cluster0.adroc.mongodb.net/littlepallet?retryWrites=true&w=majority';

let client;

module.exports = {
  async open() {
    try {
      client = await MongoClient.connect(url, {useNewUrlParser: true});
      const db = client.db('littlepallet');

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
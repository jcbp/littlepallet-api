const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';

(async () => {
  try {
    const client = await MongoClient.connect(url, {useNewUrlParser: true});
    const db = client.db('watercoon');
    console.log('DB connection success');
    const lists = db.collection('lists');
    client.close();
  }
  catch(err) {
    console.log('Error connecting to DB', err);
  }
})();


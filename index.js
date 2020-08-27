const express = require('express');
const bodyParser = require('body-parser');
const apiRouter = require('./src/routes');
const dbConn = require('./src/db-conn');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const allowCrossDomain = (req, res, next) => {
  res.header(
    'Access-Control-Allow-Origin',
    process.env.NODE_ENV === 'development'
      ? 'http://0.0.0.0:9000'
      : 'https://littlepallet.herokuapp.com'
  );
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
};

app.use(allowCrossDomain);
app.use('/api', apiRouter);

dbConn.connect().then(() => {
  app.listen(port, () => console.log(
    `Env: ${process.env.NODE_ENV}. Listening on port ${port}`
  ));
});
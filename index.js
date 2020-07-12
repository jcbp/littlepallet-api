const express = require('express');
const bodyParser = require('body-parser');

const apiRouter = require('./src/routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const allowCrossDomain = (req, res, next) => {
  // res.header('Access-Control-Allow-Origin', 'http://0.0.0.0:9000');
  res.header('Access-Control-Allow-Origin', 'littlepallet.herokuapp.com');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

app.use(allowCrossDomain);
app.use('/api', apiRouter);

app.listen(port, () => console.log(`Listening on port ${port}`));
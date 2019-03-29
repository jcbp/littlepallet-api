const express = require('express');
const bodyParser = require('body-parser');

const apiRouter = require('./routes/api');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/api', apiRouter);

app.listen(port, () => console.log(`Listening on port ${port}`));
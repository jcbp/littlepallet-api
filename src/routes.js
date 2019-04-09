const express = require('express');

const controller = require('./controller');

const router = express.Router();

router.get('/list', controller.getLists);

router.post('/', (req, res) => {
  console.log(req.body);
  res.status(200).send({message: '...'});
});

module.exports = router;
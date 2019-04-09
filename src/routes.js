const express = require('express');

const list = require('./controller');

const router = express.Router();

// router.get('/', (req, res) => res.send({message: 'lala'}));

router.get('/list', (req, res) => {
  list.getLists().then((lists) => {
    res.status(200).send(lists);
  }, (error) => {
    res.status(500).send(error);
  });
});

router.post('/', (req, res) => {
  console.log(req.body);
  res.status(200).send({message: '...'});
});

module.exports = router;
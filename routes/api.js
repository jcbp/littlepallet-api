const express = require('express');

// const list = require('../controllers/list');

const router = express.Router();

router.get('/', (req, res) => res.send({message: 'lala'}));

router.post('/', (req, res) => {
  console.log(req.body);
  res.status(200).send({message: '...'});
});

module.exports = router;
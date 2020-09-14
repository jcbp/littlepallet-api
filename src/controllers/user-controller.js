const dbConn = require('../db-conn');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('config');

const schema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().min(5).max(255).required().email(),
  password: Joi.string().min(3).max(255).required()
});
const validateUser = (user) => {
  return schema.validate(user);
};
const generateAuthToken = (userId) => { 
  return jwt.sign({ _id: userId }, config.secret);
};
const omitPassword = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

module.exports = {
  async signUp(req, res) {
    try {
      console.log('signUp', req.body);

      const { error } = validateUser(req.body);
      if(error) {
        return res.status(400).send(error.details[0].message);
      }

      const email = req.body.email.toLowerCase();
      let user = await dbConn.getCollection('users').findOne({
        email: email
      });
      if(user) {
        return res.status(400).send('User already registered');
      }

      user = await dbConn.getCollection('users').insertOne({
        'name': req.body.name,
        'email': email,
        'password': await bcrypt.hash(req.body.password, 10)
      });
      user = user.ops.pop();

      res
        .status(200)
        .header("x-auth-token", generateAuthToken(user._id))
        .send({
          _id: user._id,
          name: user.name,
          email: user.email
        });
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  async login(req, res) {
    if(!req.body.email) {
      res.status(404).send('Invalid user or password');
      return;
    }
    try {
      console.log('login');

      const user = await dbConn.getCollection('users').findOne({
        email: req.body.email.toLowerCase()
      });

      if(user && bcrypt.compareSync(req.body.password, user.password)) {
        const userWithoutPassword = omitPassword(user);

        res.status(200).send({
          message: 'success',
          auth: true,
          user: userWithoutPassword,
          access_token: jwt.sign(
            userWithoutPassword,
            config.secret,
            { expiresIn: '7d' }
          )
        });
      }
      else {
        res.status(404).send('Invalid user or password');
      }
    }
    catch(e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  getCurrent(req, res) {
    res.status(200).send(req.user);
  }
};
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
}

module.exports = {
  async signUp(req, res) {
    try {
      console.log('signUp', req.body);

      const { error } = validateUser(req.body);
      if(error) {
        return res.status(400).send(error.details[0].message);
      }

      const db = await dbConn.open();

      let user = await db.collection('users').findOne({
        email: req.body.email
      });
      if(user) {
        dbConn.close();
        return res.status(400).send('User already registered');
      }

      user = await db.collection('users').insertOne({
        'name': req.body.name,
        'email': req.body.email,
        'password': await bcrypt.hash(req.body.password, 10)
      });
      user = user.ops.pop();

      dbConn.close();

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
    try {
      console.log('login');

      const db = await dbConn.open();

      const user = await db.collection('users').findOne({
        email: req.body.email
      });

      dbConn.close();

      if(user && bcrypt.compareSync(req.body.password, user.password)) {
        const userWithoutPassword = omitPassword(user);

        res.status(200).send({
          message: 'success',
          auth: true,
          user: userWithoutPassword,
          access_token: jwt.sign(
            userWithoutPassword,
            config.secret,
            { expiresIn: '1h' }
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
};
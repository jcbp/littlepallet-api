const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  if(!token) {
    return res.status(401).send({
      message: 'Access denied. No token provided'
    });
  }

  try {
    req.user = jwt.verify(token, config.secret);
    next();
  } catch (ex) {
    res.status(400).send({
      message: 'Invalid token'
    });
  }
};

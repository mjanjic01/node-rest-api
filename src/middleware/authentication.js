const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  if (req.token) {
    jwt.verify(req.token, process.env.JWT_SECRET, (err) => {
      if (err) {
        res.json({ success: false, message: `Failed to authenticate token. ${err.message}` });
      }

      next();
    });
  } else {
    res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
};

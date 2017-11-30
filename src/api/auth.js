const jwt = require('jsonwebtoken');
const { Router } = require('express');

const router = Router();

/**
 * @api {post} /authenticate Register authentication token
 * @apiName PostAuthenticate
 * @apiGroup Authentication
 *
 * @apiSuccess {Boolean} success Status of the authentication request
 * @apiSuccess {String} message Message with additional info about the request
 * @apiSuccess {String} token Authentication token
 */
router.post('/authenticate', (req, res) => {
  // sample validation with single access code
  if (req.body.magicCode === process.env.JWT_MAGIC_CODE) {
    const token = jwt.sign({
      auth: req.body.magicCode
    }, process.env.JWT_SECRET, {
      expiresIn: '1 day'
    });

    res.json({
      success: true,
      message: 'Authentication successfull.',
      token
    });
  } else {
    res.json({ success: false, message: 'Authentication failed. User not found.' });
  }
});

module.exports = router;

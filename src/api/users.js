const { Router } = require('express');

const User = require('../models/User');

const router = Router();

/**
 * @api {get} /users Get list of all users
 * @apiName GetUsers
 * @apiGroup Users
 *
 * @apiSuccess {Array} body Array of users
 */
router.get('/users', (req, res) => {
  User.find((err, users) => {
    if (err) {
      throw err;
    }

    return res.json(users);
  });
});

/**
 * @api {get} /users/:id Get user details
 * @apiName GetUser
 * @apiGroup Users
 *
 * @apiParam {String} id Users unique ID.
 *
 * @apiError 404 User does not exist
 *
 * @apiSuccess {String} firstName First name of the User.
 * @apiSuccess {String} lastName First name of the User.
 * @apiSuccess {String} email Email address of the User.
 * @apiSuccess {String} phoneNumber Phone number of the User.
 */
router.get('/users/:id', (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if (err) {
      res.sendStatus(404);
    } else {
      res.status(200).json(user);
    }
  });
});

/**
 * @api {post} /users Create a new user
 * @apiName PostUser
 * @apiGroup Users
 *
 * @apiError 400 Invalid User data
 *
 * @apiSuccess {String} _id The autogenerated unique identifier for the User.
 * @apiSuccess {String} firstName First name of the User.
 * @apiSuccess {String} lastName First name of the User.
 * @apiSuccess {String} email Email address of the User.
 * @apiSuccess {String} phoneNumber Phone number of the User.
 */
router.post('/users', (req, res) => {
  const newUser = User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    vehicles: req.body.vehicles
  });

  newUser.save((err) => {
    if (err) {
      res.status(400).send(err.validationError || err);
    } else {
      res.status(201).json(newUser);
    }
  });
});

/**
 * @api {put} /users/:id Modify existing user data
 * @apiName PutUser
 * @apiGroup Users
 *
 * @apiParam {String} id Users unique ID.
 *
 * @apiError 404 User does not exist
 *
 * @apiSuccess {String} _id The autogenerated unique identifier for the modified User.
 * @apiSuccess {String} firstName First name of the modified User.
 * @apiSuccess {String} lastName First name of the modified User.
 * @apiSuccess {String} email Email address of the modified User.
 * @apiSuccess {String} phoneNumber Phone number of the modified User.
 */
router.put('/users/:id', (req, res) => {
  const newUser = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    vehicles: req.body.vehicles
  };

  User.findByIdAndUpdate(req.params.id, newUser, { new: true }, (err, user) => {
    if (!user) {
      res.sendStatus(404);
    } else if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(user);
    }
  });
});

/**
 * @api {delete} /users/:id Delete existing user
 * @apiName DeleteUser
 * @apiGroup Users
 *
 * @apiParam {String} id Users unique ID.
 *
 * @apiError 404 User does not exist
 */
router.delete('/users/:id', (req, res) => {
  User.findByIdAndRemove(req.params.id, (err, user) => {
    if (!user) {
      res.sendStatus(404);
    } else if (err) {
      res.status(500).send(err);
    } else {
      res.sendStatus(200);
    }
  });
});

module.exports = router;

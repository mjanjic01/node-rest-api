const { Router } = require('express');

const auth = require('./auth');
const users = require('./users');
const vehicles = require('./vehicles');

const authenticationMiddleware = require('../middleware/authentication');

const router = Router();

router.use(auth);

router.use(authenticationMiddleware);
router.use(users);
router.use(vehicles);

module.exports = router;

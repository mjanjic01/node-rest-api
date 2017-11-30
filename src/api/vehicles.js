const { Router } = require('express');

const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

const router = Router();

/**
 * @api {get} /vehicles Get list of all vehicles
 * @apiName GetVehicles
 * @apiGroup Vehicles
 *
 * @apiSuccess {Array} body Array of vehicles
 */
router.get('/vehicles', (req, res) => {
  Vehicle.find((err, users) => {
    if (err) {
      throw err;
    }

    return res.json(users);
  });
});

/**
 * @api {get} /vehicles/:id Get vehicle details
 * @apiName GetVehicle
 * @apiGroup Vehicles
 *
 * @apiParam {String} id Vehicles unique ID.
 *
 * @apiSuccess {String} type Type of the Vehicle.
 * @apiSuccess {String} brand Brand of the Vehicle.
 * @apiSuccess {String} model Model of the Vehicle.
 * @apiSuccess {String} licensePlateNumber License plate number number of the Vehicle.
 */
router.get('/vehicles/:id', (req, res) => {
  Vehicle.findById(req.params.id, (err, vehicle) => {
    if (err) {
      res.sendStatus(404);
    } else {
      res.status(200).json(vehicle);
    }
  });
});

/**
 * @api {post} /vehicles Create a new vehicle
 * @apiName PostVehicle
 * @apiGroup Vehicles
 *
 * @apiError 400 Invalid Vehicle data
 *
 * @apiSuccess {String} type Type of the Vehicle.
 * @apiSuccess {String} brand Brand of the Vehicle.
 * @apiSuccess {String} model Model of the Vehicle.
 * @apiSuccess {String} licensePlateNumber License plate number number of the Vehicle.
 */
router.post('/vehicles', (req, res) => {
  const newVehicle = Vehicle({
    type: req.body.type,
    brand: req.body.brand,
    model: req.body.model,
    licensePlateNumber: req.body.licensePlateNumber
  });

  newVehicle.save((err) => {
    if (err) {
      res.status(400).send(err.validationError || err);
    } else {
      res.status(201).json(newVehicle);
    }
  });
});

/**
 * @api {put} /vehicles/:id Modify existing vehicle data
 * @apiName PutVehicle
 * @apiGroup Vehicles
 *
 * @apiParam {String} id Vehicles unique ID.
 *
 * @apiError 404 Vehicle does not exist
 *
 * @apiSuccess {String} type Type of the modified Vehicle.
 * @apiSuccess {String} brand Brand of the modified Vehicle.
 * @apiSuccess {String} model Model of the modified Vehicle.
 * @apiSuccess {String} licensePlateNumber License plate number number of the modified Vehicle.
 */
router.put('/vehicles/:id', (req, res) => {
  const newVehicle = {
    type: req.body.type,
    brand: req.body.brand,
    model: req.body.model,
    licensePlateNumber: req.body.licensePlateNumber
  };

  Vehicle.findByIdAndUpdate(req.params.id, newVehicle, { new: true }, (err, vehicle) => {
    if (!vehicle) {
      res.sendStatus(404);
    } else if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(vehicle);
    }
  });
});

/**
 * @api {delete} /vehicles/:id Delete existing vehicle
 * @apiName DeleteVehicle
 * @apiGroup Vehicles
 *
 * @apiParam {String} id Vehicles unique ID.
 *
 * @apiError 404 Vehicle does not exist
 */
router.delete('/vehicles/:id', (req, res) => {
  Vehicle.findByIdAndRemove(req.params.id, (err, vehicle) => {
    if (!vehicle) {
      res.sendStatus(404);
    } else if (err) {
      res.status(500).send(err);
    } else {
      res.sendStatus(200);
    }
  });
});

// Nested

/**
 * @api {get} /users/:userId/vehicles Get list of all vehicles belonging to a specific user
 * @apiName GetVehiclesNested
 * @apiGroup Users/Vehicles
 *
 * @apiParam {String} userId Unique ID of the vehicles owner
 *
 * @apiSuccess {Array} body Array of vehicles
 */
router.get('/users/:userId/vehicles', (req, res) => {
  User
    .findById(req.params.userId)
    .populate('vehicles')
    .exec((err, user) => {
      if (!user) {
        res.sendStatus(404);
      } else if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).json(user.vehicles);
      }
    });
});

/**
 * @api {get} /users/:userId/vehicles/:vehicleId Get vehicle details belonging to a specific user
 * @apiName GetVehicleNested
 * @apiGroup Users/Vehicles
 *
 * @apiParam {String} vehicleId Vehicles unique ID.
 * @apiParam {String} userId Unique ID of the vehicles owner
 *
 * @apiError 404 User or Vehicle does not exist
 *
 * @apiSuccess {String} type Type of the Vehicle.
 * @apiSuccess {String} brand Brand of the Vehicle.
 * @apiSuccess {String} model Model of the Vehicle.
 * @apiSuccess {String} licensePlateNumber License plate number number of the Vehicle.
 */
router.get('/users/:userId/vehicles/:vehicleId', (req, res) => {
  User
    .findById(req.params.userId)
    .populate({
      path: 'vehicles',
      match: { _id: req.params.vehicleId }
    })
    .exec((err, user) => {
      if (!user || !user.vehicles || !user.vehicles.length) {
        res.sendStatus(404);
      } else if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).json(user.vehicles[0]);
      }
    });
});

/**
 * @api {post} /users/:userId/vehicles Create a new vehicle belonging to a specific user
 * @apiName PostVehicleNested
 * @apiGroup Users/Vehicles
 *
 * @apiParam {String} userId Unique ID of the vehicles owner
 *
 * @apiError 400 Invalid Vehicle data
 * @apiError 404 User does not exist
 *
 * @apiSuccess {String} type Type of the Vehicle.
 * @apiSuccess {String} brand Brand of the Vehicle.
 * @apiSuccess {String} model Model of the Vehicle.
 * @apiSuccess {String} licensePlateNumber License plate number number of the Vehicle.
 */
router.post('/users/:userId/vehicles', (req, res) => {
  const newVehicle = Vehicle({
    type: req.body.type,
    brand: req.body.brand,
    model: req.body.model,
    licensePlateNumber: req.body.licensePlateNumber
  });

  User.findById(req.params.userId, (usrErr, user) => {
    if (usrErr) {
      res.sendStatus(404);
    } else {
      user.vehicles.push(newVehicle);
      newVehicle.save((err) => {
        if (err) {
          res.sendStatus(400);
        } else {
          user.save(() => {
            res.status(201).json(newVehicle);
          });
        }
      });
    }
  });
});

/**
 * @api {put} /users/:userId/vehicles/:vehicleId Modify existing vehicle data belonging to a specific user
 * @apiName PutVehicleNested
 * @apiGroup Users/Vehicles
 *
 * @apiParam {String} id Vehicles unique ID.
 * @apiParam {String} userId Unique ID of the vehicles owner
 *
 * @apiError 404 User or Vehicle does not exist
 *
 * @apiSuccess {String} type Type of the modified Vehicle.
 * @apiSuccess {String} brand Brand of the modified Vehicle.
 * @apiSuccess {String} model Model of the modified Vehicle.
 * @apiSuccess {String} licensePlateNumber License plate number number of the modified Vehicle.
 */
router.put('/users/:userId/vehicles/:vehicleId', (req, res) => {
  const newVehicle = {
    type: req.body.type,
    brand: req.body.brand,
    model: req.body.model,
    licensePlateNumber: req.body.licensePlateNumber
  };

  User.findById(req.params.userId, (err, user) => {
    if (err || !user) {
      res.sendStatus(404);
    } else {
      Vehicle.findByIdAndUpdate(
        req.params.vehicleId,
        newVehicle,
        { new: true },
        (error, vehicle) => {
          if (!vehicle) {
            res.sendStatus(404);
          } else if (error) {
            res.status(500).send(error);
          } else {
            res.status(200).json(vehicle);
          }
        }
      );
    }
  });
});


/**
 * @api {delete} /users/:userId/vehicles/:vehicleId Delete existing vehicle belonging to a specific user
 * @apiName DeleteVehicleNested
 * @apiGroup Users/Vehicles
 *
 * @apiParam {String} id Vehicles unique ID.
 * @apiParam {String} userId Unique ID of the vehicles owner
 *
 * @apiError 404 User or Vehicle does not exist
 */
router.delete('/users/:userId/vehicles/:vehicleId', (req, res) => {
  User.findById(req.params.userId, (err, user) => {
    if (err || !user) {
      res.sendStatus(404);
    } else {
      Vehicle.findByIdAndRemove(req.params.vehicleId, (error, vehicle) => {
        if (!vehicle) {
          res.sendStatus(404);
        } else if (error) {
          res.status(500).send(error);
        } else {
          res.sendStatus(200);
        }
      });
    }
  });
});

module.exports = router;

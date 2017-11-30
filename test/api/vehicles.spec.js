/* eslint-disable no-underscore-dangle */

const request = require('supertest');
const faker = require('faker');
const jwt = require('jsonwebtoken');

const { assert, expect } = require('chai');

const app = require('../../src');
const Vehicle = require('../../src/models/Vehicle');
const User = require('../../src/models/User');


const token = jwt.sign({
  test: 'soclab01test'
}, process.env.JWT_SECRET, {
  expiresIn: '2 minutes'
});

const authToken = `Bearer ${token}`;
const mockVehicles = Array.from({ length: 5 }).map(() => ({
  type: faker.commerce.productMaterial(),
  brand: faker.commerce.productName(),
  model: faker.name.firstName(),
  licensePlateNumber: faker.phone.phoneNumber()
}));
const mockUsers = Array.from({ length: 5 }).map(() => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  phoneNumber: faker.phone.phoneNumber()
}));


beforeEach((done) => {
  const vehicleIds = [];
  Vehicle.remove({}, () => {
    Promise.all(mockVehicles.map(vehicle => new Promise((resolve, reject) => {
      new Vehicle(vehicle).save((err, v) => {
        if (err) {
          reject();
        } else {
          vehicleIds.push(v._id);
          resolve();
        }
      });
    }))).then(() => {
      User.remove({}, () => {
        Promise.all(mockUsers.map(user => new Promise((resolve, reject) => {
          new User({
            ...user,
            vehicles: vehicleIds
          }).save((err) => {
            if (err) {
              reject();
            } else {
              resolve();
            }
          });
        }))).then(() => done());
      });
    });
  });
});


describe('GET /api/vehicles', () => {
  it('should return list of all vehicles (200)', (done) => {
    request(app)
      .get('/api/vehicles')
      .set('Authorization', authToken)
      .expect(200)
      .end((error, res) => {
        assert(!error, `Error while fetching vehicles: ${error}`);
        expect(res.body.length).to.equal(mockVehicles.length);
        done();
      });
  });
});


describe('GET /api/vehicles/:id', () => {
  it('should return specific vehicle details (200)', (done) => {
    Vehicle.findOne({}, (err, { _id }) => {
      request(app)
        .get(`/api/vehicles/${_id}`)
        .set('Authorization', authToken)
        .expect(200, done);
    });
  });

  it('should return not found for non-existent documents (404)', (done) => {
    request(app)
      .get('/api/vehicles/123')
      .set('Authorization', authToken)
      .expect(404, done);
  });
});


describe('POST /api/vehicles', () => {
  it('should create new vehicle (201)', (done) => {
    request(app)
      .post('/api/vehicles')
      .set('Authorization', authToken)
      .set('Content-Type', 'application/json')
      .send({
        type: faker.commerce.productMaterial(),
        brand: faker.commerce.productName(),
        model: faker.name.firstName(),
        licensePlateNumber: faker.phone.phoneNumber()
      })
      .expect(201)
      .end((error, res) => {
        Vehicle.findById(res.body._id, (err, vehicle) => {
          assert(vehicle, 'Vehicle object not returned');
          assert(!err, `Error when finding vehicle in db: ${err}`);
          done();
        });
      });
  });


  it('should fail on invalid data format (400)', (done) => {
    request(app)
      .post('/api/vehicles')
      .set('Authorization', authToken)
      .set('Content-Type', 'application/json')
      .send({
        type: null,
        brand: null,
        model: null,
        licensePlateNumber: null
      })
      .expect(400, done);
  });
});

describe('PUT /api/vehicles/:id', () => {
  it('should update existing vehicle (200)', (done) => {
    const newVehicleData = {
      type: null,
      brand: null,
      model: null,
      licensePlateNumber: null
    };

    Vehicle.findOne({}, (err, { _id }) => {
      request(app)
        .put(`/api/vehicles/${_id}`)
        .set('Authorization', authToken)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(newVehicleData))
        .expect(200)
        .end((error, res) => {
          assert.isNotEmpty(res.body, 'Vehicle object not returned');
          assert.equal(res.body.firstName, newVehicleData.firstName);
          assert.equal(res.body.lastName, newVehicleData.lastName);
          assert.equal(res.body.email, newVehicleData.email);
          assert.equal(res.body.phoneNumber, newVehicleData.phoneNumber);
          assert.deepEqual(res.body.vehicles, newVehicleData.vehicles);

          done();
        });
    });
  });

  it('should return not found for non-existent documents (404)', (done) => {
    request(app)
      .put('/api/vehicles/123')
      .set('Authorization', authToken)
      .expect(404, done);
  });
});


describe('DELETE /api/vehicles/:id', () => {
  it('should delete existing vehicle (200)', (done) => {
    Vehicle.findOne({}, (err, { _id }) => {
      request(app)
        .delete(`/api/vehicles/${_id}`)
        .set('Authorization', authToken)
        .expect(200)
        .end(() => {
          Vehicle.findById(_id, (error, doc) => {
            expect(doc).to.equal(null);
            done();
          });
        });
    });
  });

  it('should return not found for non-existent documents (404)', (done) => {
    request(app)
      .delete('/api/vehicles/123')
      .set('Authorization', authToken)
      .expect(404, done);
  });
});

// Nested

describe('GET /api/users/:userId/vehicles', () => {
  it('should return list of all vehicles belonging to specified user (200)', (done) => {
    User.findOne({}, (err, { _id }) => {
      request(app)
        .get(`/api/users/${_id}/vehicles`)
        .set('Authorization', authToken)
        .expect(200)
        .end((error, res) => {
          assert(!error, `Error while fetching vehicles: ${error}`);
          expect(res.body.length).to.equal(mockVehicles.length);
          done();
        });
    });
  });
});


describe('GET /api/users/:userId/vehicles/:vehicleId', () => {
  it('should return specific vehicle details belonging to specified user (200)', (done) => {
    User.findOne({}, (err, user) => {
      const userId = user._id;
      Vehicle.findOne({}, (error, { _id }) => {
        request(app)
          .get(`/api/users/${userId}/vehicles/${_id}`)
          .set('Authorization', authToken)
          .expect(200, done);
      });
    });
  });

  it('should return not found for non-existent vehicles (404)', (done) => {
    User.findOne({}, (err, { _id }) => {
      request(app)
        .get(`/api/users/${_id}/vehicles/123`)
        .set('Authorization', authToken)
        .expect(404, done);
    });
  });

  it('should return not found for non-existent users (404)', (done) => {
    request(app)
      .get('/api/users/123/vehicles/123')
      .set('Authorization', authToken)
      .expect(404, done);
  });
});


describe('POST /api/users/:userId/vehicles', () => {
  it('should create new vehicle belonging to specified user (201)', (done) => {
    User.findOne({}, (usrErr, { _id }) => {
      request(app)
        .post(`/api/users/${_id}/vehicles`)
        .set('Authorization', authToken)
        .set('Content-Type', 'application/json')
        .send({
          type: faker.commerce.productMaterial(),
          brand: faker.commerce.productName(),
          model: faker.name.firstName(),
          licensePlateNumber: faker.phone.phoneNumber()
        })
        .expect(201)
        .end((error, res) => {
          Vehicle.findById(res.body._id, (err, vehicle) => {
            assert(vehicle, 'Vehicle object not returned');
            assert(!err, `Error when finding vehicle in db: ${err}`);
            done();
          });
        });
    });
  });


  it('should fail on invalid data format (400)', (done) => {
    User.findOne({}, (usrErr, { _id }) => {
      request(app)
        .post(`/api/users/${_id}/vehicles`)
        .set('Authorization', authToken)
        .set('Content-Type', 'application/json')
        .send({
          type: null,
          brand: null,
          model: null,
          licensePlateNumber: null
        })
        .expect(400, done);
    });
  });
});

describe('PUT /api/users/:userId/vehicles/:id', () => {
  it('should update existing vehicle belonging to specified user (200)', (done) => {
    const newVehicleData = {
      type: null,
      brand: null,
      model: null,
      licensePlateNumber: null
    };
    User.findOne({}, (usrErr, user) => {
      const userId = user._id;
      Vehicle.findOne({}, (err, { _id }) => {
        request(app)
          .put(`/api/users/${userId}/vehicles/${_id}`)
          .set('Authorization', authToken)
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(newVehicleData))
          .expect(200)
          .end((error, res) => {
            assert.isNotEmpty(res.body, 'Vehicle object not returned');
            assert.equal(res.body.firstName, newVehicleData.firstName);
            assert.equal(res.body.lastName, newVehicleData.lastName);
            assert.equal(res.body.email, newVehicleData.email);
            assert.equal(res.body.phoneNumber, newVehicleData.phoneNumber);
            assert.deepEqual(res.body.vehicles, newVehicleData.vehicles);

            done();
          });
      });
    });
  });

  it('should return not found for non-existent vehicles (404)', (done) => {
    User.findOne({}, (err, { _id }) => {
      request(app)
        .put(`/api/users/${_id}/vehicles/123`)
        .set('Authorization', authToken)
        .expect(404, done);
    });
  });

  it('should return not found for non-existent users (404)', (done) => {
    request(app)
      .put('/api/users/123/vehicles/123')
      .set('Authorization', authToken)
      .expect(404, done);
  });
});


describe('DELETE /api/users/:userId/vehicles/:id', () => {
  it('should delete existing vehicle belonging to specified user (200)', (done) => {
    User.findOne({}, (usrErr, user) => {
      const userId = user._id;
      Vehicle.findOne({}, (err, { _id }) => {
        request(app)
          .delete(`/api/users/${userId}/vehicles/${_id}`)
          .set('Authorization', authToken)
          .expect(200)
          .end(() => {
            Vehicle.findById(_id, (error, doc) => {
              expect(doc).to.equal(null);
              done();
            });
          });
      });
    });
  });

  it('should return not found for non-existent vehicles (404)', (done) => {
    User.findOne({}, (err, { _id }) => {
      request(app)
        .delete(`/api/users/${_id}/vehicles/123`)
        .set('Authorization', authToken)
        .expect(404, done);
    });
  });

  it('should return not found for non-existent users (404)', (done) => {
    request(app)
      .delete('/api/users/123/vehicles/123')
      .set('Authorization', authToken)
      .expect(404, done);
  });
});

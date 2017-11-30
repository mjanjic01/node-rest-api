/* eslint-disable no-underscore-dangle */

const request = require('supertest');
const faker = require('faker');
const jwt = require('jsonwebtoken');

const { assert, expect } = require('chai');

const app = require('../../src');
const User = require('../../src/models/User');

const token = jwt.sign({
  test: 'soclab01test'
}, process.env.JWT_SECRET, {
  expiresIn: '2 minutes'
});

const authToken = `Bearer ${token}`;
const mockUsers = Array.from({ length: 5 }).map(() => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  phoneNumber: faker.phone.phoneNumber(),
  vehicles: []
}));


beforeEach((done) => {
  User.remove({}, () => {
    Promise.all(mockUsers.map(user => new Promise((resolve, reject) => {
      new User(user).save((err) => {
        if (err) {
          reject();
        } else {
          resolve();
        }
      });
    }))).then(() => done());
  });
});


describe('GET /api/users', () => {
  it('should return list of all users (200)', (done) => {
    request(app)
      .get('/api/users')
      .set('Authorization', authToken)
      .expect(200)
      .end((error, res) => {
        assert(!error, `Error while fetching users: ${error}`);
        expect(res.body.length).to.equal(mockUsers.length);
        done();
      });
  });
});


describe('GET /api/users/:id', () => {
  it('should return specific user details (200)', (done) => {
    User.findOne({}, (err, { _id }) => {
      request(app)
        .get(`/api/users/${_id}`)
        .set('Authorization', authToken)
        .expect(200, done);
    });
  });

  it('should return not found for non-existent documents (404)', (done) => {
    request(app)
      .get('/api/users/123')
      .set('Authorization', authToken)
      .expect(404, done);
  });
});


describe('POST /api/users', () => {
  it('should create new user (201)', (done) => {
    request(app)
      .post('/api/users')
      .set('Authorization', authToken)
      .set('Content-Type', 'application/json')
      .send({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        phoneNumber: faker.phone.phoneNumber(),
        vehicles: []
      })
      .expect(201)
      .end((error, res) => {
        User.findById(res.body._id, (err, user) => {
          assert(user, 'User object not returned');
          assert(!err, `Error when finding user in db: ${err}`);
          done();
        });
      });
  });


  it('should fail on invalid data format (400)', (done) => {
    request(app)
      .post('/api/users')
      .set('Authorization', authToken)
      .set('Content-Type', 'application/json')
      .send({
        firstName: null,
        lastName: null,
        email: null,
        phoneNumber: null,
        vehicles: []
      })
      .expect(400, done);
  });
});

describe('PUT /api/users/:id', () => {
  it('should update existing user (200)', (done) => {
    const newUserData = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      vehicles: []
    };

    User.findOne({}, (err, { _id }) => {
      request(app)
        .put(`/api/users/${_id}`)
        .set('Authorization', authToken)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(newUserData))
        .expect(200)
        .end((error, res) => {
          assert.isNotEmpty(res.body, 'User object not returned');
          assert.equal(res.body.firstName, newUserData.firstName);
          assert.equal(res.body.lastName, newUserData.lastName);
          assert.equal(res.body.email, newUserData.email);
          assert.equal(res.body.phoneNumber, newUserData.phoneNumber);
          assert.deepEqual(res.body.vehicles, newUserData.vehicles);

          done();
        });
    });
  });

  it('should return not found for non-existent documents (404)', (done) => {
    request(app)
      .put('/api/users/123')
      .set('Authorization', authToken)
      .expect(404, done);
  });
});


describe('DELETE /api/users/:id', () => {
  it('should delete existing user (200)', (done) => {
    User.findOne({}, (err, { _id }) => {
      request(app)
        .delete(`/api/users/${_id}`)
        .set('Authorization', authToken)
        .expect(200)
        .end(() => {
          User.findById(_id, (error, doc) => {
            expect(doc).to.equal(null);
            done();
          });
        });
    });
  });

  it('should return not found for non-existent documents (404)', (done) => {
    request(app)
      .delete('/api/users/123')
      .set('Authorization', authToken)
      .expect(404, done);
  });
});

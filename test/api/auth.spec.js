/* eslint-disable no-underscore-dangle */

const request = require('supertest');
const { assert } = require('chai');

require('dotenv').config(); // load magic code for authentication

const app = require('../../src');

describe('POST /api/authenticate', () => {
  it('should reject authentication request with incorrect code (403)', (done) => {
    request(app)
      .post('/api/authenticate')
      .set('Content-Type', 'application/json')
      .send({
        magicCode: 'invalidAccessCode'
      })
      .expect(403)
      .end((error, res) => {
        assert(!res.body.success, 'Faulty authentication response should have success set to false');
        done();
      });
  });

  it('should reject authentication request without access code (403)', (done) => {
    request(app)
      .post('/api/authenticate')
      .set('Content-Type', 'application/json')
      .expect(403)
      .end((error, res) => {
        assert(!res.body.success, 'Faulty authentication response should have success set to false');
        done();
      });
  });

  it('should authenticate the user with correct code successfully (200)', (done) => {
    request(app)
      .post('/api/authenticate')
      .set('Content-Type', 'application/json')
      .send({
        magicCode: process.env.JWT_MAGIC_CODE
      })
      .end((error, res) => {
        assert(res.body.success, 'Authentication response should have success set to true');
        done();
      });
  });
});

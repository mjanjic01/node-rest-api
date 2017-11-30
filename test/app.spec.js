/* eslint-disable no-underscore-dangle */

const request = require('supertest');

const app = require('../src');

describe('GET /', () => {
  it('should return api documentation (200)', (done) => {
    request(app)
      .get('/')
      .expect(200, done);
  });
});

describe('GET /non_existing_route', () => {
  it('should return not found (404)', (done) => {
    request(app)
      .get('/non_existing_route')
      .expect(404, done);
  });
});

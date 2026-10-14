const test = require('node:test');
const assert = require('node:assert/strict');
const { requireAdmin } = require('./admin.middleware');

const createResponse = () => ({
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  }
});

test('rejects a customer with 403', () => {
  const response = createResponse();
  let nextCalled = false;

  requireAdmin({ user: { role: 'CUSTOMER' } }, response, () => {
    nextCalled = true;
  });

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.success, false);
  assert.equal(nextCalled, false);
});

test('allows an administrator', () => {
  const response = createResponse();
  let nextCalled = false;

  requireAdmin({ user: { role: 'ADMIN' } }, response, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(response.statusCode, null);
});

test('rejects a request with no authenticated user', () => {
  const response = createResponse();

  requireAdmin({}, response, () => {
    assert.fail('next should not be called for an unauthenticated request');
  });

  assert.equal(response.statusCode, 403);
});

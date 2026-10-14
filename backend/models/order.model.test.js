const test = require('node:test');
const assert = require('node:assert/strict');
const Order = require('./order.model');

test('allows cancelled orders in the order status enum', () => {
  const statusPath = Order.schema.path('status');

  assert.ok(statusPath.enumValues.includes('CANCELLED'));
});

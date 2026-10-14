const test = require('node:test');
const assert = require('node:assert/strict');
const getRazorpayConfig = require('./razorpay');

test('requires both Razorpay credentials', () => {
  const previousKeyId = process.env.RAZORPAY_KEY_ID;
  const previousKeySecret = process.env.RAZORPAY_KEY_SECRET;

  delete process.env.RAZORPAY_KEY_ID;
  delete process.env.RAZORPAY_KEY_SECRET;

  try {
    assert.throws(
      () => getRazorpayConfig(),
      { code: 'RAZORPAY_NOT_CONFIGURED' }
    );
  } finally {
    if (previousKeyId === undefined) {
      delete process.env.RAZORPAY_KEY_ID;
    } else {
      process.env.RAZORPAY_KEY_ID = previousKeyId;
    }

    if (previousKeySecret === undefined) {
      delete process.env.RAZORPAY_KEY_SECRET;
    } else {
      process.env.RAZORPAY_KEY_SECRET = previousKeySecret;
    }
  }
});

test('creates a Razorpay client when both credentials are set', () => {
  const previousKeyId = process.env.RAZORPAY_KEY_ID;
  const previousKeySecret = process.env.RAZORPAY_KEY_SECRET;
  process.env.RAZORPAY_KEY_ID = 'rzp_test_unit';
  process.env.RAZORPAY_KEY_SECRET = 'unit_test_secret';

  try {
    const config = getRazorpayConfig();

    assert.equal(config.keyId, 'rzp_test_unit');
    assert.equal(typeof config.client.orders.create, 'function');
    assert.equal(typeof config.client.orders.fetchPayments, 'function');
  } finally {
    if (previousKeyId === undefined) {
      delete process.env.RAZORPAY_KEY_ID;
    } else {
      process.env.RAZORPAY_KEY_ID = previousKeyId;
    }

    if (previousKeySecret === undefined) {
      delete process.env.RAZORPAY_KEY_SECRET;
    } else {
      process.env.RAZORPAY_KEY_SECRET = previousKeySecret;
    }
  }
});

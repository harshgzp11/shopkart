const Razorpay = require('razorpay');

const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret
});

module.exports = razorpay;

const Razorpay = require('razorpay');

const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    const error = new Error('Razorpay credentials are not configured');
    error.code = 'RAZORPAY_NOT_CONFIGURED';
    throw error;
  }

  return {
    keyId,
    keySecret,
    client: new Razorpay({ key_id: keyId, key_secret: keySecret })
  };
};

module.exports = getRazorpayConfig;

const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - No Token Provided'
      });
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || typeof decoded === 'string' || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid Token'
      });
    }


    const customer = await Customer.findById(decoded.id).select('-password');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }


    req.user = customer;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid or expired token'
      });
    }

    console.error('Error in protectRoute middleware:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  protectRoute
};

const jwt = require('jsonwebtoken');

const generateTokenAndSetCookie = (customerId, res) => {

  const token = jwt.sign({ id: customerId }, process.env.JWT_SECRET, {
    expiresIn: '15d',
  });


  res.cookie('jwt', token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV !== 'development',
  });
};

module.exports = generateTokenAndSetCookie;

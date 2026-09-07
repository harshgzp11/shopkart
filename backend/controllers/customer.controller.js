const bcrypt = require('bcrypt');
const Customer = require('../models/customer.model');
const generateTokenAndSetCookie = require('../utils/generateToken');


const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;


    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are mandatory' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must contain at least 6 characters' });
    }


    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const newCustomer = new Customer({
      fullName,
      email,
      password: hashedPassword,
      phone
    });

    await newCustomer.save();


    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: newCustomer._id,
        fullName: newCustomer.fullName,
        email: newCustomer.email,
        phone: newCustomer.phone
      }
    });

  } catch (error) {
    console.log('Error in registerCustomer:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;


    const customer = await Customer.findOne({ email });
    

    const isPasswordCorrect = await bcrypt.compare(password, customer?.password || "");


    if (!customer || !isPasswordCorrect) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }


    generateTokenAndSetCookie(customer._id, res);

    res.status(200).json({
      success: true,
      message: 'Login successful'
    });

  } catch (error) {
    console.log('Error in loginCustomer:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const getMyProfile = async (req, res) => {
  try {

    const customer = req.user;

    res.status(200).json({
      _id: customer._id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone
    });
  } catch (error) {
    console.log('Error in getMyProfile:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const logoutCustomer = async (req, res) => {
  try {

    res.cookie('jwt', '', { maxAge: 0 });
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.log('Error in logoutCustomer:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    

    const customer = await Customer.findById(req.user._id);


    const isPasswordCorrect = await bcrypt.compare(oldPassword, customer.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ success: false, message: 'Incorrect old password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must contain at least 6 characters' });
    }


    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    customer.password = hashedNewPassword;
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.log('Error in changePassword:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  changePassword
};

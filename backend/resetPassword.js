const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Customer = require('./models/customer.model');
require('dotenv').config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'harshgzp11@gmail.com';
    const newPassword = 'password123';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const customer = await Customer.findOne({ email });
    if (!customer) {
      console.log('Customer not found');
      process.exit(1);
    }

    customer.password = hashedPassword;
    await customer.save();

    console.log(`Password reset successfully for ${email}. New password: ${newPassword}`);
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
};

resetPassword();

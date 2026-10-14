require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const connectToDatabase = require('./config/database');
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  const requiredEnvironmentVariables = ['MONGO_URI', 'JWT_SECRET'];
  const missingEnvironmentVariables = requiredEnvironmentVariables.filter(
    (name) => !process.env[name]
  );

  if (missingEnvironmentVariables.length > 0) {
    console.error(
      `Missing required environment variables: ${missingEnvironmentVariables.join(', ')}`
    );
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('replace_with_')) {
    console.error('JWT_SECRET must be a unique random value of at least 32 characters.');
    process.exit(1);
  }

  connectToDatabase()
    .then(() => {
      console.log('Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch(async (error) => {
      console.error('Unable to start server:', error.message);
      await mongoose.disconnect();
      process.exitCode = 1;
    });
}

module.exports = app;

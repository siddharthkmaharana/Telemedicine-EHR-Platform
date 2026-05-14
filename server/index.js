require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined.');
  process.exit(1);
} else {
  console.log('Using MONGODB_URI:', MONGODB_URI.replace(/:([^:@]{1,})@/, ':****@'));
}

// Connect to MongoDB with retry logic
const connectWithRetry = (retries = 5) => {
  console.log(`Connecting to MongoDB... (Retries left: ${retries})`);
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Successfully connected to MongoDB.');
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB:', err.message);
      if (retries > 0) {
        console.log('Retrying in 5 seconds...');
        setTimeout(() => connectWithRetry(retries - 1), 5000);
      } else {
        console.error('All retry attempts failed. Exiting.');
        process.exit(1);
      }
    });
};

connectWithRetry();

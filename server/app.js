const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Basic Route for testing
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Platform API is running' });
});

// Future API routes will be mounted here
// e.g., app.use('/api/auth', require('./routes/auth'));
// e.g., app.use('/api/ehr', require('./routes/ehr'));

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal Server Error' 
  });
});

module.exports = app;

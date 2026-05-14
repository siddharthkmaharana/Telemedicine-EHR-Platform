const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security Middlewares
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
// app.use('/api/', limiter);

// Middlewares
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Basic Route for testing
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Platform API is running' });
});

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/records', require('./routes/recordRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/telehealth', require('./routes/telehealthRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));

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

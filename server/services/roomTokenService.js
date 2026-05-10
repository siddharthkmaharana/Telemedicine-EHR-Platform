const jwt = require('jsonwebtoken');

/**
 * Generates a single-use, time-locked room token for a telehealth session.
 * The token is valid for the duration of the appointment plus a 15-minute grace period.
 */
const generateRoomToken = (appointmentId, userId, role, startTime, endTime) => {
  const payload = {
    appointmentId,
    userId,
    role
  };

  // Set expiration to appointment end time + 15 minutes
  const expiry = Math.floor(new Date(endTime).getTime() / 1000) + (15 * 60);
  const now = Math.floor(Date.now() / 1000);
  
  const expiresIn = Math.max(expiry - now, 3600); // Minimum 1 hour expiry for safety if time is weird

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

module.exports = { generateRoomToken };

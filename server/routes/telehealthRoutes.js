const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const { generateRoomToken } = require('../services/roomTokenService');

router.get('/token/:appointmentId', auth, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findById(appointmentId)
      .populate({ path: 'patientId', select: 'userId' })
      .populate({ path: 'doctorId', select: 'userId' });

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Authorization: Only the patient or doctor assigned to this appointment can get a token
    const isAuthorized = 
      appointment.patientId.userId.toString() === req.user.userId || 
      appointment.doctorId.userId.toString() === req.user.userId;

    if (!isAuthorized) return res.status(403).json({ message: "Unauthorized access to this room" });

    // Time-lock: Only allow token generation 10 minutes before the start time
    const now = new Date();
    const startTime = new Date(appointment.startTime);
    const leadTime = 10 * 60 * 1000; // 10 minutes

    if (now < new Date(startTime.getTime() - leadTime)) {
      return res.status(400).json({ 
        message: "Room is not active yet. Please join closer to your appointment time." 
      });
    }

    const token = generateRoomToken(
      appointmentId, 
      req.user.userId, 
      req.user.role, 
      appointment.startTime, 
      appointment.endTime
    );

    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

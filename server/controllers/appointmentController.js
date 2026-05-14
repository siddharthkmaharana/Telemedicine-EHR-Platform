const Appointment = require('../models/Appointment');
const { checkForCollision } = require('../services/schedulingEngine');
const notificationService = require('../services/notificationService');

exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, startTime, endTime } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Collision Check
    const isColliding = await checkForCollision(doctorId, start, end);
    if (isColliding) {
      return res.status(409).json({
        success: false,
        message: "The doctor is already booked for this time slot."
      });
    }

    const appointment = new Appointment({
      ...req.body,
      startTime: start,
      endTime: end,
      status: 'pending'
    });

    await appointment.save();

    // Fetch Patient and Doctor details for notification
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate({ path: 'patientId', populate: { path: 'userId' } })
      .populate({ path: 'doctorId', populate: { path: 'userId' } });

    if (populatedAppointment && populatedAppointment.patientId && populatedAppointment.doctorId) {
      const patient = populatedAppointment.patientId.userId;
      const doctor = populatedAppointment.doctorId.userId;
      
      const patientName = `${patient.firstName} ${patient.lastName}`;
      const doctorName = `${doctor.firstName} ${doctor.lastName}`;

      // Trigger email asynchronously
      notificationService.sendAppointmentConfirmation(patient.email, patientName, doctorName, start);
      
      // Mock SMS
      notificationService.sendSMS("patient-phone-number", `Your appointment with Dr. ${doctorName} on ${start.toLocaleString()} is confirmed.`);
    }

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query.patientId = req.user.userId;
    } else if (req.user.role === 'doctor') {
      query.doctorId = req.user.userId;
    }

    const appointments = await Appointment.find(query).populate('patientId doctorId');
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

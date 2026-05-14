const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { checkForCollision } = require('../services/schedulingEngine');

exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, startTime, endTime } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Get the patient record ID for the logged-in user
    const patient = await Patient.findOne({ userId: req.user.userId });
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient profile not found." });
    }

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
      patientId: patient._id,
      startTime: start,
      endTime: end,
      status: 'pending'
    });

    await appointment.save();
    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'firstName lastName email' } })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'firstName lastName email' } });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPatientAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    if (!patient) return res.status(404).json({ message: "Patient profile not found" });

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'firstName lastName email' } })
      .sort({ startTime: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'firstName lastName email' } })
      .sort({ startTime: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

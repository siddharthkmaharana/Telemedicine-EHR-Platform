const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled',
  },
  reasonForVisit: {
    type: String,
  },
  roomToken: {
    type: String, // Secure WebRTC room token
  }
}, { timestamps: true });

// Basic collision check logic can be added in pre-save or in the controller
// For now, indexing startTime and doctorId helps query overlaps
appointmentSchema.index({ doctorId: 1, startTime: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);

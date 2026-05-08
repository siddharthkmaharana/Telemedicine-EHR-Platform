const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const medicalRecordSchema = new mongoose.Schema({
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
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  // All PHI fields are encrypted
  diagnoses: {
    type: String, // Store JSON stringified arrays or plain text, encrypted
    set: encrypt,
    get: decrypt,
  },
  vitalSigns: {
    type: String, // E.g., "{ bloodPressure: '120/80', heartRate: 75 }", encrypted
    set: encrypt,
    get: decrypt,
  },
  allergyHistory: {
    type: String, // Encrypted string or stringified JSON
    set: encrypt,
    get: decrypt,
  },
  clinicalNotes: {
    type: String,
    set: encrypt,
    get: decrypt,
  }
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);

const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true }
});

const prescriptionSchema = new mongoose.Schema({
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
  // We can encrypt the medications array by stringifying it if highly sensitive, 
  // but usually standard schema is better for querying. 
  // For strict compliance, let's encrypt it.
  medicationsData: {
    type: String, // Stringified JSON array of medicationSchema
    set: encrypt,
    get: decrypt,
  },
  instructions: {
    type: String,
    set: encrypt,
    get: decrypt,
  },
  digitalSignature: {
    type: String, // Hash or signature verifying doctor's identity
    required: true,
  },
  qrCodeHash: {
    type: String, // Hash to generate QR code for verification
  }
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model('Prescription', prescriptionSchema);

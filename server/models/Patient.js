const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Encrypted fields
  dateOfBirth: {
    type: String, // Store as string because it will be encrypted
    set: encrypt,
    get: decrypt,
  },
  gender: {
    type: String,
  },
  address: {
    type: String,
    set: encrypt,
    get: decrypt,
  },
  emergencyContact: {
    name: { type: String, set: encrypt, get: decrypt },
    phone: { type: String, set: encrypt, get: decrypt },
    relation: { type: String }
  },
  bloodGroup: {
    type: String,
  }
}, { 
  timestamps: true,
  toJSON: { getters: true }, // Ensure getters are applied when converting to JSON
  toObject: { getters: true }
});

module.exports = mongoose.model('Patient', patientSchema);

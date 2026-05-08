const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
  },
  consultationFee: {
    type: Number,
    required: true,
  },
  availability: [{
    dayOfWeek: {
      type: Number, // 0 = Sunday, 1 = Monday, etc.
      min: 0,
      max: 6
    },
    startTime: String, // e.g., "09:00"
    endTime: String,   // e.g., "17:00"
  }],
  bio: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);

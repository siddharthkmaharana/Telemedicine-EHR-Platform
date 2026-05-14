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
  licenseId: {
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
  },
  experienceYears: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 4.5
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);

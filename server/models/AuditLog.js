const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Can be null if action is unauthenticated
  },
  ipAddress: {
    type: String,
    required: true,
  },
  action: {
    type: String, // e.g., 'READ', 'CREATE', 'UPDATE', 'DELETE'
    required: true,
  },
  resourcePath: {
    type: String, // e.g., '/api/medical-records'
    required: true,
  },
  details: {
    type: String, // Additional details about the action
  }
});

// Create an index to automatically expire old logs after 7 years (compliance requirement example)
// 7 years = 60 * 60 * 24 * 365 * 7 = 220752000 seconds
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 220752000 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

const AuditLog = require('../models/AuditLog');

exports.getAllLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({})
      .populate('userId', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

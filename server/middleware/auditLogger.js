const AuditLog = require('../models/AuditLog');

const auditLogger = async (req, res, next) => {
  // Capture original end function to log after response is sent
  const originalEnd = res.end;

  res.end = function (chunk, encoding) {
    res.end = originalEnd;
    res.end(chunk, encoding);

    // After response is sent, record the audit log asynchronously
    const logEntry = new AuditLog({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip || req.connection.remoteAddress,
      action: req.method,
      resourcePath: req.originalUrl,
      details: `Status Code: ${res.statusCode}`
    });

    logEntry.save().catch(err => {
      console.error('Audit Log Failed to Save:', err);
    });
  };

  next();
};

module.exports = auditLogger;

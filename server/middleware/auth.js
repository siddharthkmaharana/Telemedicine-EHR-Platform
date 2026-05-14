const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    console.log(`[AUTH] Token received for endpoint: ${req.originalUrl}`);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`[AUTH] Decoded User: ${decoded.userId}, Role: ${decoded.role}`);
    
    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error(`[AUTH ERROR] ${error.message}`);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
};

module.exports = { 
  authenticate, 
  authorize,
  auth: authenticate,
  roleGuard: authorize
};

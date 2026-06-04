const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, authorize('admin'), auditController.getAllLogs);

module.exports = router;

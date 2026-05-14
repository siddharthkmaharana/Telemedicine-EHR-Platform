const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { auth } = require('../middleware/auth');

router.get('/', auth, doctorController.getAllDoctors);
router.put('/:id', auth, doctorController.updateDoctorStatus);

module.exports = router;

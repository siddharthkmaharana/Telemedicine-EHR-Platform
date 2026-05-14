const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { auth } = require('../middleware/auth');

router.get('/', doctorController.getAllDoctors);
router.get('/me', auth, doctorController.getDoctorProfile);
router.get('/:id', doctorController.getDoctorById);
router.put('/:id', auth, doctorController.updateDoctor);
router.delete('/:id', auth, doctorController.deleteDoctor);

module.exports = router;

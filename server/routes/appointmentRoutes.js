const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { auth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { createAppointmentSchema } = require('../validations/medicalValidation');

router.get('/', auth, appointmentController.getAppointments);
router.get('/patient/me', auth, appointmentController.getPatientAppointments);
router.get('/doctor/me', auth, appointmentController.getDoctorAppointments);
router.put('/:id/status', auth, appointmentController.updateAppointmentStatus);
router.post('/', auth, validateRequest(createAppointmentSchema), appointmentController.createAppointment);

module.exports = router;

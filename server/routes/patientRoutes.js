const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { auth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { updatePatientSchema } = require('../validations/medicalValidation');

router.get('/', auth, patientController.getAllPatients);
router.get('/me', auth, patientController.getPatientProfileMe);
router.get('/:id', auth, patientController.getPatientProfile);
router.put('/:id', auth, validateRequest(updatePatientSchema), patientController.updatePatientProfile);

module.exports = router;

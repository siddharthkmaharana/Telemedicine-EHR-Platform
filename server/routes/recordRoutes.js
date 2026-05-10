const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { auth, roleGuard } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { createMedicalRecordSchema } = require('../validations/medicalValidation');

router.get('/:patientId', auth, roleGuard(['doctor', 'admin']), recordController.getPatientRecords);
router.post('/', auth, roleGuard(['doctor']), validateRequest(createMedicalRecordSchema), recordController.createRecord);
router.put('/:id', auth, roleGuard(['doctor']), recordController.updateRecord);

module.exports = router;

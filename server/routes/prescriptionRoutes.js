const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/prescriptions - Create a new prescription (Doctor only)
router.post(
  '/', 
  authenticate, 
  authorize('doctor'), 
  prescriptionController.createPrescription
);

// GET /api/prescriptions/doctor/me - Get all prescriptions for the current doctor
router.get(
  '/doctor/me',
  authenticate,
  authorize('doctor'),
  prescriptionController.getDoctorPrescriptions
);

// GET /api/prescriptions/patient/me - Get all prescriptions for the current patient
router.get(
  '/patient/me',
  authenticate,
  authorize('patient'),
  prescriptionController.getPatientPrescriptions
);
// GET /api/prescriptions - Get all prescriptions (Admin only)
router.get(
  '/',
  authenticate,
  authorize('admin'),
  prescriptionController.getAllPrescriptions
);

// GET /api/prescriptions/:id/download - Download prescription PDF (Patient and Doctor)
router.get(
  '/:id/download', 
  authenticate, 
  authorize('doctor', 'patient'), 
  prescriptionController.downloadPrescription
);

// GET /api/prescriptions/verify/:hash - Public verification endpoint (Unauthenticated)
router.get(
  '/verify/:hash', 
  prescriptionController.verifyPrescription
);

module.exports = router;

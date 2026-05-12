const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User');
const prescriptionService = require('../services/prescriptionService');

exports.createPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId, medicationsData, instructions } = req.body;
    const doctorUserId = req.user.id;

    // 1. Get Doctor info
    const doctor = await Doctor.findOne({ userId: doctorUserId });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    const doctorUser = await User.findById(doctorUserId);
    
    // 2. Get Patient info
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    
    const patientUser = await User.findById(patient.userId);

    // 3. Prepare data for PDF
    const prescriptionData = {
      prescriptionId: 'temp_id', // Will update after save
      patientName: `${patientUser.firstName} ${patientUser.lastName}`,
      doctorName: `${doctorUser.firstName} ${doctorUser.lastName}`,
      doctorLicense: doctor.licenseNumber,
      issuedAt: new Date(),
      medications: JSON.parse(medicationsData),
      instructions
    };

    // 4. Generate PDF hash and signature
    const { hash } = await prescriptionService.generatePrescription(prescriptionData);

    // 5. Save to Database
    const prescription = new Prescription({
      patientId,
      doctorId: doctor._id,
      appointmentId,
      medicationsData,
      instructions,
      digitalSignature: hash, // Using hash as digital signature for this demo
      qrCodeHash: hash
    });

    await prescription.save();

    res.status(201).json({
      message: 'Prescription created successfully',
      prescriptionId: prescription._id,
      hash
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating prescription', error: error.message });
  }
};

exports.downloadPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findById(id)
      .populate('patientId')
      .populate('doctorId');

    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });

    // Authorization check: Only assigned patient or doctor can download
    // (Simplified for demo)

    const doctorUser = await User.findById(prescription.doctorId.userId);
    const patientUser = await User.findById(prescription.patientId.userId);

    const prescriptionData = {
      prescriptionId: prescription._id,
      patientName: `${patientUser.firstName} ${patientUser.lastName}`,
      doctorName: `${doctorUser.firstName} ${doctorUser.lastName}`,
      doctorLicense: prescription.doctorId.licenseNumber,
      issuedAt: prescription.createdAt,
      medications: JSON.parse(prescription.medicationsData),
      instructions: prescription.instructions
    };

    const { doc } = await prescriptionService.generatePrescription(prescriptionData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription_${id}.pdf`);
    
    doc.pipe(res);
  } catch (error) {
    res.status(500).json({ message: 'Error downloading prescription', error: error.message });
  }
};

exports.verifyPrescription = async (req, res) => {
  try {
    const { hash } = req.params;
    const prescription = await Prescription.findOne({ qrCodeHash: hash })
      .populate('patientId')
      .populate('doctorId');

    if (!prescription) {
      return res.status(404).json({ 
        verified: false, 
        message: 'Prescription not found or invalid hash' 
      });
    }

    // Verify again to be sure
    const doctorUser = await User.findById(prescription.doctorId.userId);
    const patientUser = await User.findById(prescription.patientId.userId);

    const originalData = {
      prescriptionId: prescription._id,
      patientName: `${patientUser.firstName} ${patientUser.lastName}`,
      doctorName: `${doctorUser.firstName} ${doctorUser.lastName}`,
      doctorLicense: prescription.doctorId.licenseNumber,
      issuedAt: prescription.createdAt,
      medications: JSON.parse(prescription.medicationsData),
      instructions: prescription.instructions
    };

    const isValid = prescriptionService.verifyHash(hash, originalData);

    if (isValid) {
      res.status(200).json({
        verified: true,
        message: 'Prescription verified as authentic',
        data: {
          doctor: originalData.doctorName,
          patient: originalData.patientName,
          date: originalData.issuedAt,
          medications: originalData.medications
        }
      });
    } else {
      res.status(400).json({ verified: false, message: 'Hash mismatch - possibly tampered' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Verification error', error: error.message });
  }
};

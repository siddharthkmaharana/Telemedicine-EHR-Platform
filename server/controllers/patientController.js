const Patient = require('../models/Patient');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().populate({
      path: 'userId',
      select: 'firstName lastName email'
    });
    
    // Format for frontend
    const formatted = patients.map(p => ({
      ...p._doc,
      full_name: p.userId ? `${p.userId.firstName} ${p.userId.lastName}` : 'Unknown',
      email: p.userId?.email || 'N/A'
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPatientProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Authorization: Patient can only view own profile; Doctor/Admin can view any
    if (req.user.role === 'patient' && req.user.userId !== id) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    await AuditLog.create({
      userId: req.user.userId,
      ipAddress: req.ip,
      method: 'GET',
      endpoint: `/api/patients/${id}`,
      resourceId: id,
      action: 'READ_PATIENT_PROFILE'
    });

    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePatientProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role === 'patient' && req.user.userId !== id) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const patient = await Patient.findByIdAndUpdate(id, req.body, { new: true });

    await AuditLog.create({
      userId: req.user.userId,
      ipAddress: req.ip,
      method: 'PUT',
      endpoint: `/api/patients/${id}`,
      resourceId: id,
      action: 'UPDATE_PATIENT_PROFILE'
    });

    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const MedicalRecord = require('../models/MedicalRecord');
const AuditLog = require('../models/AuditLog');

exports.createRecord = async (req, res) => {
  try {
    const record = new MedicalRecord(req.body);
    await record.save();

    // Log the creation for compliance
    await AuditLog.create({
      userId: req.user.userId,
      ipAddress: req.ip,
      method: 'POST',
      endpoint: '/api/records',
      resourceId: record._id,
      action: 'CREATE_MEDICAL_RECORD'
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPatientRecords = async (req, res) => {
  try {
    const { patientId } = req.params;
    const records = await MedicalRecord.find({ patientId, isArchived: false }).sort({ recordDate: -1 });

    await AuditLog.create({
      userId: req.user.userId,
      ipAddress: req.ip,
      method: 'GET',
      endpoint: `/api/records/${patientId}`,
      resourceId: patientId,
      action: 'READ_PATIENT_RECORDS'
    });

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await MedicalRecord.findByIdAndUpdate(id, req.body, { new: true });

    await AuditLog.create({
      userId: req.user.userId,
      ipAddress: req.ip,
      method: 'PUT',
      endpoint: `/api/records/${id}`,
      resourceId: id,
      action: 'UPDATE_MEDICAL_RECORD'
    });

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

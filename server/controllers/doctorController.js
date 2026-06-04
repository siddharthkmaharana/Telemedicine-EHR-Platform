const Doctor = require('../models/Doctor');
const User = require('../models/User');

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate({
      path: 'userId',
      select: 'firstName lastName email'
    });
    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDoctorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(id, { isActive }, { new: true });
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

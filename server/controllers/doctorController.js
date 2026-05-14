const Doctor = require('../models/Doctor');
const User = require('../models/User');

// Get all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const { specialization } = req.query;
    const filter = specialization ? { specialization } : {};
    
    const doctors = await Doctor.find(filter)
      .populate('userId', 'firstName lastName email role')
      .sort({ createdAt: -1 });
      
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get doctor by ID
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'firstName lastName email role');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update doctor profile
exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('userId', 'firstName lastName email role');
    
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current doctor profile
exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId })
      .populate('userId', 'firstName lastName email role');
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete/Deactivate doctor (simplified for this task)
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, specialization, licenseId, consultationFee, experienceYears } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const user = new User({ email, password, role, firstName, lastName });
    await user.save();

    // Create profile based on role
    if (role === 'doctor') {
      const doctor = new Doctor({
        userId: user._id,
        specialization: specialization || 'General Medicine',
        licenseId: licenseId || `LIC-${Date.now()}`,
        consultationFee: consultationFee || 500,
        experienceYears: experienceYears || 0
      });
      await doctor.save();
    } else if (role === 'patient') {
      const patient = new Patient({
        userId: user._id
      });
      await patient.save();
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({ 
      success: true, 
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ 
      success: true, 
      token, 
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

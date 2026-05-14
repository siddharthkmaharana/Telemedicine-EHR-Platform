const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const user = new User({ email, password, role, firstName, lastName });
    await user.save();

    // Create profile based on role
    if (role === 'doctor') {
      const Doctor = require('../models/Doctor');
      await new Doctor({
        userId: user._id,
        specialization: req.body.specialization || 'General Medicine',
        licenseNumber: req.body.licenseId || 'N/A',
        consultationFee: req.body.consultationFee || 500,
        experienceYears: req.body.experienceYears || 1
      }).save();
    } else if (role === 'patient') {
      const Patient = require('../models/Patient');
      await new Patient({
        userId: user._id
      }).save();
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({ success: true, token });
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
        userId: user._id,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

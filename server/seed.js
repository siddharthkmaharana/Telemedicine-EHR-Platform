const mongoose = require('mongoose');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    console.log('Cleared existing data.');

    const password = 'Demo@123';

    // 1. Create Admin
    const adminUser = await User.create({
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@medisync.com',
      password: password,
      role: 'admin'
    });
    console.log('Admin user created.');

    // 2. Create Doctor
    const doctorUser = await User.create({
      firstName: 'Siddharth',
      lastName: 'Maharana',
      email: 'doctor@medisync.com',
      password: password,
      role: 'doctor'
    });
    
    await Doctor.create({
      userId: doctorUser._id,
      specialization: 'Cardiology',
      licenseNumber: 'MD12345',
      consultationFee: 150,
      bio: 'Experienced cardiologist with 10+ years in clinical practice.'
    });
    console.log('Doctor user and profile created.');

    // 3. Create Patient
    const patientUser = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'patient@medisync.com',
      password: password,
      role: 'patient'
    });

    await Patient.create({
      userId: patientUser._id,
      dateOfBirth: '1990-01-01',
      gender: 'Male',
      address: '123 Health St, Wellness City',
      bloodGroup: 'O+'
    });
    console.log('Patient user and profile created.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();

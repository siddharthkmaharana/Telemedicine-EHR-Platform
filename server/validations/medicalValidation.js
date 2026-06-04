const { z } = require('zod');

// Schema for creating a Medical Record
const createMedicalRecordSchema = z.object({
  patientId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Patient ID format"),
  doctorId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Doctor ID format"),
  recordDate: z.string().datetime().optional(),
  chiefComplaint: z.string().min(5, "Chief complaint must be at least 5 characters"),
  clinicalNotes: z.string().min(10, "Clinical notes must be at least 10 characters"),
  diagnoses: z.array(z.string()).min(1, "At least one diagnosis is required"),
  vitalSigns: z.object({
    bloodPressure: z.string().optional(),
    heartRate: z.number().optional(),
    temperature: z.number().optional(),
    respiratoryRate: z.number().optional()
  }).optional()
});

// Schema for creating an Appointment
const createAppointmentSchema = z.object({
  doctorId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Doctor ID format"),
  startTime: z.string().datetime("Start time must be a valid ISO-8601 date"),
  endTime: z.string().datetime("End time must be a valid ISO-8601 date"),
  timezone: z.string().default("UTC"),
  notes: z.string().optional()
});

// Schema for updating a Patient Profile
const updatePatientSchema = z.object({
  fullName: z.string().min(2).optional(),
  contactInfo: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional()
  }).optional(),
  address: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional()
  }).optional()
});

module.exports = {
  createMedicalRecordSchema,
  createAppointmentSchema,
  updatePatientSchema
};

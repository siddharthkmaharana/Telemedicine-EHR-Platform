
// Mock data and client logic to replace base44 SDK
let mockData = {
    Appointment: [
        { id: '1', patient_name: 'Siddharth kumar Maharana', patient_email: 'patient@medisync.com', doctor_email: 'doctor@medisync.com', doctor_name: 'Dr. Samay Shukla', date: new Date().toISOString().split('T')[0], start_time: '09:00', status: 'confirmed' },
        { id: '2', patient_name: 'Rahul Verma', patient_email: 'rahul@example.com', doctor_email: 'doctor@medisync.com', doctor_name: 'Dr. Samay Shukla', date: new Date().toISOString().split('T')[0], start_time: '10:00', status: 'pending' },
        { id: '3', patient_name: 'Sneha Patel', patient_email: 'sneha@example.com', doctor_email: 'doctor@medisync.com', doctor_name: 'Dr. Samay Shukla', date: new Date().toISOString().split('T')[0], start_time: '14:00', status: 'pending' },
    ],
    Prescription: [
        { id: '1', patient_name: 'Siddharth kumar Maharana', patient_email: 'patient@medisync.com', doctor_email: 'doctor@medisync.com', doctor_name: 'Dr. Samay Shukla', date: new Date().toISOString().split('T')[0], medications: 'Paracetamol 500mg\nAmoxicillin 250mg' },
        { id: '2', patient_name: 'Rahul Verma', patient_email: 'rahul@example.com', doctor_email: 'doctor@medisync.com', doctor_name: 'Dr. Samay Shukla', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], medications: 'Ibuprofen 400mg' },
    ],
    MedicalRecords: [
        { id: '1', patient_email: 'patient@medisync.com', title: 'Complete Blood Count (CBC)', date: '2023-10-01', type: 'Lab Result', document_url: '#' },
        { id: '2', patient_email: 'patient@medisync.com', title: 'Chest X-Ray', date: '2023-09-15', type: 'Imaging', document_url: '#' }
    ],
    Doctor: [
        { id: '1', email: 'doctor@medisync.com', name: 'Dr. Samay Shukla', specialty: 'General Physician', experience: 10, rating: 4.8, user_email: 'doctor@medisync.com', full_name: 'Dr. Samay Shukla' }
    ],
    Patient: [
        { id: '1', email: 'patient@medisync.com', name: 'Siddharth kumar Maharana', age: 32, gender: 'Male', blood_group: 'O+' }
    ],
    AuditLog: [
        { id: '1', timestamp: new Date().toISOString(), user: 'admin@medisync.com', role: 'admin', action: 'LOGIN', resource: 'System', description: 'Admin logged in', is_phi: false },
        { id: '2', timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'doctor@medisync.com', role: 'doctor', action: 'READ', resource: 'Patient Record', description: 'Viewed patient Siddharth kumar Maharana history', is_phi: true }
    ],
    ClinicSettings: []
};

const createMockEntity = (entityName) => ({
    list: async () => {
        // Support for sort flags like '-created_date' (ignored for now in mock)
        return [...(mockData[entityName] || [])];
    },
    filter: async (criteria) => {
        const data = mockData[entityName] || [];
        return data.filter(item => {
            for (let key in criteria) {
                if (item[key] !== criteria[key]) return false;
            }
            return true;
        });
    },
    create: async (data) => {
        const newItem = { id: Math.random().toString(36).substr(2, 9), ...data };
        if (!mockData[entityName]) mockData[entityName] = [];
        mockData[entityName].push(newItem);
        return newItem;
    },
    update: async (id, data) => {
        const list = mockData[entityName] || [];
        const index = list.findIndex(item => item.id === id);
        if (index > -1) {
            list[index] = { ...list[index], ...data };
            return list[index];
        }
        throw new Error('Not found');
    },
    delete: async (id) => {
        const list = mockData[entityName] || [];
        const index = list.findIndex(item => item.id === id);
        if (index > -1) {
            list.splice(index, 1);
            return true;
        }
        return false;
    }
});

export const mockClient = {
    entities: {
        Appointment: createMockEntity('Appointment'),
        Prescription: createMockEntity('Prescription'),
        MedicalRecords: createMockEntity('MedicalRecords'),
        MedicalRecord: createMockEntity('MedicalRecords'),
        Doctor: createMockEntity('Doctor'),
        Patient: createMockEntity('Patient'),
        AuditLog: createMockEntity('AuditLog'),
        ClinicSettings: createMockEntity('ClinicSettings')
    }
};

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, FileText, Download, CheckCircle } from 'lucide-react';
import apiClient from '@/lib/api';

const FREQ_OPTIONS = ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'As needed', 'Weekly'];
const DURATION_OPTIONS = ['3 days', '5 days', '7 days', '10 days', '14 days', '21 days', '30 days', 'Ongoing'];

const emptyMed = () => ({ drug_name: '', dosage: '', frequency: 'Once daily', duration: '7 days', notes: '' });

export default function WritePrescription() {
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [patientSearch, setPatientSearch] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedAppt, setSelectedAppt] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [medications, setMedications] = useState([emptyMed()]);
    const [instructions, setInstructions] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [lastPrescriptionId, setLastPrescriptionId] = useState(null);
    const user = JSON.parse(localStorage.getItem('medisync_user') || '{}');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const patientId = params.get('patientId');
        const apptId = params.get('apptId');

        const fetchData = async () => {
            try {
                const [apptsRes, patientsRes] = await Promise.all([
                    apiClient.get('/appointments/doctor/me'),
                    apiClient.get('/patients')
                ]);
                
                const appts = apptsRes.data;
                const pts = patientsRes.data;

                setAppointments(appts);
                setPatients(pts);

                if (patientId) {
                    const pt = pts.find(p => p._id === patientId);
                    if (pt) { 
                        setSelectedPatient(pt); 
                        setPatientSearch(pt.full_name || pt.email); 
                    }
                }
                if (apptId) setSelectedAppt(apptId);
            } catch (err) {
                console.error("Failed to fetch data", err);
            }
        };

        fetchData();
    }, []);

    const addMed = () => setMedications(m => [...m, emptyMed()]);
    const removeMed = (i) => setMedications(m => m.filter((_, idx) => idx !== i));
    const updateMed = (i, key, val) => setMedications(m => m.map((med, idx) => idx === i ? { ...med, [key]: val } : med));

    const handleSave = async () => {
        if (!selectedPatient || !diagnosis || medications.every(m => !m.drug_name)) return;
        setSaving(true);
        try {
            const response = await apiClient.post('/prescriptions', {
                patientId: selectedPatient._id,
                appointmentId: selectedAppt,
                medicationsData: JSON.stringify(medications.filter(m => m.drug_name)),
                instructions: `${diagnosis}. ${instructions}`
            });
            
            setLastPrescriptionId(response.data.prescriptionId);
            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Failed to save prescription", err);
            setSaving(false);
        }
    };

    const downloadPDF = async () => {
        if (!lastPrescriptionId) return;
        try {
            const response = await apiClient.get(`/prescriptions/download/${lastPrescriptionId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `prescription_${lastPrescriptionId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Failed to download PDF", err);
        }
    };

    const filteredAppts = appointments.filter(a => !selectedPatient || a.patient_email === selectedPatient.patient_email);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="space-y-5">
                <h2 className="text-xl font-bold text-[#F1F5F9]">Write Prescription</h2>

                {/* Patient selector */}
                <div>
                    <label className="text-xs text-[#64748B] uppercase tracking-wider mb-1.5 block">Patient</label>
                    <div className="relative">
                        <input value={patientSearch} onChange={e => { setPatientSearch(e.target.value); setSelectedPatient(null); }}
                            placeholder="Search patient by name..."
                            className="w-full px-4 py-3 rounded-xl text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                        {patientSearch && !selectedPatient && (
                            <div className="absolute top-full mt-1 w-full rounded-xl overflow-hidden z-10"
                                style={{ background: '#151D2E', border: '1px solid rgba(255,255,255,0.1)' }}>
                                {appointments.filter(a => a.patient_name?.toLowerCase().includes(patientSearch.toLowerCase()))
                                    .map(a => (
                                        <button key={a.patient_email} onClick={() => { setSelectedPatient(a); setPatientSearch(a.patient_name); }}
                                            className="w-full px-4 py-3 text-left text-sm text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.06)]">
                                            {a.patient_name} <span className="text-[#64748B] text-xs">({a.patient_email})</span>
                                        </button>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Appointment */}
                <div>
                    <label className="text-xs text-[#64748B] uppercase tracking-wider mb-1.5 block">Linked Appointment</label>
                    <select value={selectedAppt} onChange={e => setSelectedAppt(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm text-[#F1F5F9] outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <option value="">Select appointment</option>
                        {filteredAppts.map(a => (
                            <option key={a.id} value={a.id}>{a.patient_name} — {a.date} at {a.start_time}</option>
                        ))}
                    </select>
                </div>

                {/* Diagnosis */}
                <div>
                    <label className="text-xs text-[#64748B] uppercase tracking-wider mb-1.5 block">Diagnosis Summary</label>
                    <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} rows={2}
                        placeholder="Brief diagnosis summary..."
                        className="w-full px-4 py-3 rounded-xl text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none resize-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>

                {/* Medications */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-xs text-[#64748B] uppercase tracking-wider">Medications</label>
                        <button onClick={addMed} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                            style={{ background: 'rgba(124,58,237,0.15)', color: '#7C3AED' }}>
                            <Plus size={12} /> Add
                        </button>
                    </div>
                    <div className="space-y-3">
                        {medications.map((med, i) => (
                            <div key={i} className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="flex justify-between">
                                    <span className="text-xs text-[#64748B]">Medication {i + 1}</span>
                                    {i > 0 && <button onClick={() => removeMed(i)}><Trash2 size={13} color="#EF4444" /></button>}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <input value={med.drug_name} onChange={e => updateMed(i, 'drug_name', e.target.value)} placeholder="Drug name"
                                        className="col-span-2 px-3 py-2 rounded-lg text-xs text-[#F1F5F9] placeholder-[#64748B] outline-none"
                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }} />
                                    <input value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} placeholder="Dosage (e.g., 500mg)"
                                        className="px-3 py-2 rounded-lg text-xs text-[#F1F5F9] placeholder-[#64748B] outline-none"
                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }} />
                                    <select value={med.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)}
                                        className="px-3 py-2 rounded-lg text-xs text-[#F1F5F9] outline-none"
                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        {FREQ_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                    <select value={med.duration} onChange={e => updateMed(i, 'duration', e.target.value)}
                                        className="px-3 py-2 rounded-lg text-xs text-[#F1F5F9] outline-none"
                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        {DURATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                    <input value={med.notes} onChange={e => updateMed(i, 'notes', e.target.value)} placeholder="Additional notes"
                                        className="px-3 py-2 rounded-lg text-xs text-[#F1F5F9] placeholder-[#64748B] outline-none"
                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Instructions */}
                <div>
                    <label className="text-xs text-[#64748B] uppercase tracking-wider mb-1.5 block">Additional Instructions</label>
                    <textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={2}
                        placeholder="Patient instructions, lifestyle advice..."
                        className="w-full px-4 py-3 rounded-xl text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none resize-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>

                <div className="flex gap-3">
                    <motion.button onClick={handleSave} disabled={saving || !selectedPatient || !diagnosis}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="flex-1 py-3 rounded-xl font-semibold text-sm disabled:opacity-50"
                        style={{ background: saved ? '#00D9B8' : '#7C3AED', color: '#fff' }}>
                        {saved ? <span className="flex items-center justify-center gap-2"><CheckCircle size={14} /> Saved!</span>
                            : saving ? 'Saving...' : 'Save Prescription'}
                    </motion.button>
                    <motion.button onClick={downloadPDF} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="px-5 py-3 rounded-xl font-semibold text-sm"
                        style={{ background: 'rgba(124,58,237,0.15)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.3)' }}>
                        <Download size={16} />
                    </motion.button>
                </div>
            </div>

            {/* Live Preview */}
            <div className="card-surface p-6 h-fit sticky top-8">
                <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
                    <FileText size={15} color="#7C3AED" /> Live Preview
                </h3>
                <div className="rounded-xl p-6 text-sm" style={{ background: '#fff', color: '#1a1a1a', fontFamily: 'monospace' }}>
                    <div className="text-center mb-4 pb-3" style={{ borderBottom: '2px solid #7C3AED' }}>
                        <div className="text-lg font-bold text-[#7C3AED]">MediSync</div>
                        <div className="text-xs text-gray-500">Premium Telemedicine Platform</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                        <div><strong>Patient:</strong> {selectedPatient?.patient_name || '—'}</div>
                        <div><strong>Doctor:</strong> {user.name}</div>
                        <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                    </div>
                    <div className="mb-3 text-xs"><strong>Diagnosis:</strong> {diagnosis || '—'}</div>
                    <div className="mb-3">
                        <strong className="text-xs">Medications:</strong>
                        <div className="mt-1 space-y-1">
                            {medications.filter(m => m.drug_name).map((m, i) => (
                                <div key={i} className="text-xs bg-gray-50 p-2 rounded">
                                    <strong>{m.drug_name}</strong> — {m.dosage} — {m.frequency} — {m.duration}
                                </div>
                            ))}
                            {medications.every(m => !m.drug_name) && <div className="text-xs text-gray-400">No medications added</div>}
                        </div>
                    </div>
                    {instructions && <div className="text-xs mb-3"><strong>Instructions:</strong> {instructions}</div>}
                    <div className="text-xs pt-3 mt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                        <div>Signed: {user.name}</div>
                        <div className="text-gray-400">SHA-256: {`sha256:${Math.random().toString(36).slice(2, 10)}...`}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

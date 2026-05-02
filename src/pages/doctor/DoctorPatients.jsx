import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User, AlertTriangle, Heart, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import EmptyState from '@/components/medisync/EmptyState';

export default function DoctorPatients() {
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [records, setRecords] = useState([]);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('medisync_user') || '{}');

    useEffect(() => {
        Promise.all([
            base44.entities.Appointment.filter({ doctor_email: user.email }),
            base44.entities.Patient.list(),
            base44.entities.MedicalRecord.filter({ doctor_email: user.email }),
        ]).then(([appts, pts, recs]) => {
            setAppointments(appts);
            setPatients(pts);
            setRecords(recs);
            setLoading(false);
        });
    }, []);

    const uniquePatients = [...new Map(appointments.map(a => [a.patient_email, a])).values()];
    const filtered = uniquePatients.filter(p =>
        p.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.patient_email?.toLowerCase().includes(search.toLowerCase())
    );

    const getPatientDetails = (email) => patients.find(p => p.user_email === email);
    const getPatientRecords = (email) => records.filter(r => r.patient_email === email);
    const getPatientAppointments = (email) => appointments.filter(a => a.patient_email === email);
    const getLastVisit = (email) => {
        const appts = getPatientAppointments(email).filter(a => a.status === 'completed');
        return appts.length > 0 ? appts.sort((a, b) => b.date.localeCompare(a.date))[0].date : 'N/A';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <span className="text-sm text-[#64748B]">{filtered.length} patients</span>
            </div>

            {loading ? (
                <div className="space-y-2">{[1, 2, 3, 4].map(i => <div key={i} className="card-surface h-16 shimmer" />)}</div>
            ) : filtered.length === 0 ? (
                <div className="card-surface"><EmptyState icon={User} title="No Patients Found" message="Patients from your appointments will appear here" color="violet" /></div>
            ) : (
                <div className="card-surface overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                {['Patient', 'Email', 'Last Visit', 'Records', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-5 py-3.5 text-xs font-medium uppercase tracking-wider text-[#64748B]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p, i) => (
                                <motion.tr key={p.patient_email} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                    className="hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                                                style={{ background: 'rgba(124,58,237,0.15)', color: '#7C3AED' }}>
                                                {p.patient_name?.charAt(0) || 'P'}
                                            </div>
                                            <span className="text-sm font-medium text-[#F1F5F9]">{p.patient_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-[#64748B]">{p.patient_email}</td>
                                    <td className="px-5 py-4 text-sm text-[#64748B]">{getLastVisit(p.patient_email)}</td>
                                    <td className="px-5 py-4 text-sm text-[#64748B]">{getPatientRecords(p.patient_email).length}</td>
                                    <td className="px-5 py-4">
                                        <button onClick={() => setSelected(p)}
                                            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-105"
                                            style={{ background: 'rgba(124,58,237,0.15)', color: '#7C3AED' }}>
                                            View Record
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Patient Detail Drawer */}
            <AnimatePresence>
                {selected && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end" onClick={() => setSelected(null)}>
                        <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="glass-elevated h-full w-full max-w-lg p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-[#F1F5F9]">Patient Detail</h3>
                                <button onClick={() => setSelected(null)} className="text-[#64748B] hover:text-[#F1F5F9]"><X size={18} /></button>
                            </div>

                            {/* Demographics */}
                            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl" style={{ background: 'rgba(124,58,237,0.08)' }}>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl"
                                    style={{ background: 'rgba(124,58,237,0.2)', color: '#7C3AED' }}>
                                    {selected.patient_name?.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-[#F1F5F9]">{selected.patient_name}</div>
                                    <div className="text-sm text-[#64748B]">{selected.patient_email}</div>
                                </div>
                            </div>

                            {(() => {
                                const details = getPatientDetails(selected.patient_email);
                                return details ? (
                                    <div className="space-y-2 mb-6">
                                        {[
                                            { icon: Heart, label: 'Blood Group', value: details.blood_group || 'O+' },
                                            { icon: AlertTriangle, label: 'Allergies', value: details.allergies?.join(', ') || 'None' },
                                        ].map(item => (
                                            <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl"
                                                style={{ background: 'rgba(255,255,255,0.04)' }}>
                                                <item.icon size={14} color="#64748B" />
                                                <span className="text-xs text-[#64748B]">{item.label}:</span>
                                                <span className="text-xs font-medium text-[#F1F5F9]">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : null;
                            })()}

                            {/* Medical Timeline */}
                            <h4 className="text-sm font-semibold text-[#F1F5F9] mb-3">Medical History</h4>
                            <div className="space-y-3">
                                {getPatientRecords(selected.patient_email).map((rec, i) => (
                                    <div key={rec.id} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock size={12} color="#64748B" />
                                            <span className="text-xs text-[#64748B]">{rec.visit_date}</span>
                                        </div>
                                        <div className="text-sm font-medium text-[#F1F5F9]">{rec.diagnosis || 'General Visit'}</div>
                                        {rec.notes && <div className="text-xs text-[#64748B] mt-1">{rec.notes}</div>}
                                    </div>
                                ))}
                                {getPatientRecords(selected.patient_email).length === 0 && (
                                    <div className="text-sm text-[#64748B] text-center py-4">No records available</div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
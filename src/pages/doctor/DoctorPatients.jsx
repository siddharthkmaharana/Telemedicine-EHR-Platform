import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User, AlertTriangle, Heart, Clock } from 'lucide-react';
import EmptyState from '@/components/medisync/EmptyState';
import apiClient from '@/lib/api';

export default function DoctorPatients() {
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [records, setRecords] = useState([]);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('medisync_user') || '{}');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch independently so one failure doesn't block the others
                apiClient.get('/appointments/doctor/me').then(res => setAppointments(res.data)).catch(e => console.error("Appts failed", e));
                apiClient.get('/patients').then(res => setPatients(res.data)).catch(e => console.error("Patients failed", e));
                apiClient.get('/records/doctor/me').then(res => setRecords(res.data)).catch(e => console.error("Records failed", e));
            } finally {
                // Delay slightly to ensure state updates have started
                setTimeout(() => setLoading(false), 800);
            }
        };
        fetchData();
    }, []);

    const uniquePatients = React.useMemo(() => {
        const patientMap = new Map();
        
        // Strategy: Build a map using the most reliable ID possible
        
        // 1. Process global patients list first
        if (patients && Array.isArray(patients)) {
            patients.forEach(p => {
                const id = p._id || p.id;
                if (id) patientMap.set(id.toString(), p);
            });
        }
        
        // 2. Overlay patients from appointments (these are definitely real and current)
        if (appointments && Array.isArray(appointments)) {
            appointments.forEach(appt => {
                const p = appt.patientId;
                if (p) {
                    const id = p._id || p.id || p; // Handle case where patientId is just an ID string
                    const idStr = id.toString();
                    
                    if (typeof p === 'object' && p._id) {
                        // We have the full object, use it to ensure we have name/email
                        patientMap.set(idStr, p);
                    } else if (!patientMap.has(idStr)) {
                        // We only have the ID and no global object yet, create a placeholder
                        patientMap.set(idStr, { _id: idStr, isPlaceholder: true });
                    }
                }
            });
        }
        
        return Array.from(patientMap.values());
    }, [patients, appointments]);

    const filtered = uniquePatients.filter(p => {
        if (!p) return false;
        const user = p.userId || {};
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        const email = user.email || '';
        const name = `${firstName} ${lastName}`.trim() || (p.isPlaceholder ? `Patient ID: ${p._id.slice(-6)}` : 'Anonymous Patient');
        
        const searchLower = search.toLowerCase();
        return name.toLowerCase().includes(searchLower) || email.toLowerCase().includes(searchLower);
    });

    const getPatientRecords = (patientId) => records.filter(r => r.patientId === patientId || r.patientId?._id === patientId);
    const getPatientAppointments = (patientId) => appointments.filter(a => a.patientId?._id === patientId);
    const getLastVisit = (patientId) => {
        const appts = getPatientAppointments(patientId).filter(a => a.status === 'completed');
        return appts.length > 0 ? new Date(appts.sort((a, b) => b.startTime.localeCompare(a.startTime))[0].startTime).toLocaleDateString() : 'N/A';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-[#F1F5F9] placeholder-[#94A3B8] outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <span className="text-sm text-[#94A3B8]">{filtered.length} patients</span>
            </div>

            {loading ? (
                <div className="space-y-2">{[1, 2, 3, 4].map(i => <div key={i} className="card-surface h-16 shimmer" />)}</div>
            ) : filtered.length === 0 ? (
                <div className="card-surface"><EmptyState icon={User} title="No Patients Found" message="No registered patients found in the system." color="violet" action={null} actionLabel="" /></div>
            ) : (
                <div className="card-surface overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                {['Patient', 'Email', 'Last Visit', 'Records', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-5 py-3.5 text-xs font-medium uppercase tracking-wider text-[#94A3B8]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p, i) => {
                                const name = `${p.userId?.firstName || ''} ${p.userId?.lastName || ''}`.trim() || (p.isPlaceholder ? `ID: ${p._id.slice(-6)}` : 'Anonymous');
                                return (
                                    <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                        className="hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                                                    style={{ background: 'rgba(124,58,237,0.15)', color: '#7C3AED' }}>
                                                    {name.charAt(0) || 'P'}
                                                </div>
                                                <span className="text-sm font-bold text-white">{name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-[#94A3B8]">{p.userId?.email}</td>
                                        <td className="px-5 py-4 text-sm text-[#94A3B8]">{getLastVisit(p._id)}</td>
                                        <td className="px-5 py-4 text-sm text-[#94A3B8]">{getPatientRecords(p._id).length}</td>
                                        <td className="px-5 py-4">
                                            <button onClick={() => setSelected(p)}
                                                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-105"
                                                style={{ background: 'rgba(124,58,237,0.15)', color: '#7C3AED' }}>
                                                View Record
                                            </button>
                                        </td>
                                    </motion.tr>
                                );
                            })}
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
                                <button onClick={() => setSelected(null)} className="text-[#94A3B8] hover:text-[#F1F5F9]"><X size={18} /></button>
                            </div>

                            {/* Demographics */}
                            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl" style={{ background: 'rgba(124,58,237,0.08)' }}>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl"
                                    style={{ background: 'rgba(124,58,237,0.2)', color: '#7C3AED' }}>
                                    {`${selected.userId?.firstName || ''} ${selected.userId?.lastName || ''}`.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-[#F1F5F9]">{`${selected.userId?.firstName || ''} ${selected.userId?.lastName || ''}`}</div>
                                    <div className="text-sm text-[#94A3B8]">{selected.userId?.email}</div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                {[
                                    { icon: Heart, label: 'Blood Group', value: selected.bloodGroup || 'N/A' },
                                    { icon: AlertTriangle, label: 'Allergies', value: selected.allergies?.join(', ') || 'None' },
                                ].map(item => (
                                    <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl"
                                        style={{ background: 'rgba(255,255,255,0.04)' }}>
                                        <item.icon size={14} color="#94A3B8" />
                                        <span className="text-xs text-[#94A3B8]">{item.label}:</span>
                                        <span className="text-xs font-medium text-[#F1F5F9]">{item.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Medical Timeline */}
                            <h4 className="text-sm font-semibold text-[#F1F5F9] mb-3">Medical History</h4>
                            <div className="space-y-3">
                                {getPatientRecords(selected._id).map((rec, i) => (
                                    <div key={rec._id} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock size={12} color="#94A3B8" />
                                            <span className="text-xs text-[#94A3B8]">{new Date(rec.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-sm font-medium text-[#F1F5F9]">{rec.diagnosis || 'General Visit'}</div>
                                        {rec.notes && <div className="text-xs text-[#94A3B8] mt-1">{rec.notes}</div>}
                                    </div>
                                ))}
                                {getPatientRecords(selected._id).length === 0 && (
                                    <div className="text-sm text-[#94A3B8] text-center py-4">No records available</div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

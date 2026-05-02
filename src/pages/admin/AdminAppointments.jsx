import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StatusBadge from '@/components/medisync/StatusBadge';
import EmptyState from '@/components/medisync/EmptyState';

export default function AdminAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        base44.entities.Appointment.list('-created_date').then(a => { setAppointments(a); setLoading(false); });
    }, []);

    const cancelAppointment = async (id) => {
        await base44.entities.Appointment.update(id, { status: 'cancelled' });
        setAppointments(a => a.map(appt => appt.id === id ? { ...appt, status: 'cancelled' } : appt));
        setSelected(null);
    };

    const filtered = appointments.filter(a => {
        const matchSearch = a.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
            a.doctor_name?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-48">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by patient or doctor..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl text-sm text-[#F1F5F9] outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                        <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="card-surface h-48 shimmer" />
            ) : filtered.length === 0 ? (
                <div className="card-surface"><EmptyState title="No Appointments Found" message="Appointments will appear here" color="teal" /></div>
            ) : (
                <div className="card-surface overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                {['Patient', 'Doctor', 'Date & Time', 'Specialization', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-5 py-4 text-xs font-medium uppercase tracking-wider text-[#64748B]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((appt, i) => (
                                <motion.tr key={appt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                    className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                    <td className="px-5 py-4 text-sm font-medium text-[#F1F5F9]">{appt.patient_name}</td>
                                    <td className="px-5 py-4 text-sm text-[#64748B]">{appt.doctor_name}</td>
                                    <td className="px-5 py-4 text-sm text-[#64748B]">{appt.date} {appt.start_time}</td>
                                    <td className="px-5 py-4 text-sm text-[#64748B]">{appt.doctor_specialization || 'N/A'}</td>
                                    <td className="px-5 py-4"><StatusBadge status={appt.status} /></td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setSelected(appt)}
                                                className="text-xs px-3 py-1.5 rounded-lg font-medium"
                                                style={{ background: 'rgba(0,217,184,0.15)', color: '#00D9B8' }}>
                                                View
                                            </button>
                                            {appt.status === 'pending' && (
                                                <button onClick={() => cancelAppointment(appt.id)}
                                                    className="text-xs px-3 py-1.5 rounded-lg font-medium"
                                                    style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <AnimatePresence>
                {selected && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-elevated rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-base font-bold text-[#F1F5F9]">Appointment Details</h3>
                                <button onClick={() => setSelected(null)}><X size={18} color="#64748B" /></button>
                            </div>
                            <div className="space-y-3 text-sm">
                                {[
                                    { label: 'Patient', value: selected.patient_name },
                                    { label: 'Doctor', value: selected.doctor_name },
                                    { label: 'Date', value: selected.date },
                                    { label: 'Time', value: selected.start_time },
                                    { label: 'Specialization', value: selected.doctor_specialization || 'N/A' },
                                    { label: 'Chief Complaint', value: selected.chief_complaint || 'N/A' },
                                    { label: 'Room Token', value: selected.room_token ? selected.room_token.slice(0, 20) + '...' : 'N/A' },
                                ].map(item => (
                                    <div key={item.label} className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        <span className="text-[#64748B]">{item.label}</span>
                                        <span className="font-medium text-[#F1F5F9] text-right max-w-[60%] truncate">{item.value}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between py-2 items-center">
                                    <span className="text-[#64748B]">Status</span>
                                    <StatusBadge status={selected.status} />
                                </div>
                            </div>
                            {selected.status === 'pending' && (
                                <button onClick={() => cancelAppointment(selected.id)}
                                    className="w-full mt-5 py-2.5 rounded-xl text-sm font-semibold"
                                    style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                                    Cancel Appointment
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
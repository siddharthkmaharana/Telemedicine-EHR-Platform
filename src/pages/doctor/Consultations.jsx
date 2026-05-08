import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, X, FileText } from 'lucide-react';
import { mockClient } from '@/lib/mockClient';
import StatusBadge from '@/components/medisync/StatusBadge';
import EmptyState from '@/components/medisync/EmptyState';
import { useNavigate } from 'react-router-dom';

export default function Consultations() {
    const [appointments, setAppointments] = useState([]);
    const [records, setRecords] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('medisync_user') || '{}');

    useEffect(() => {
        Promise.all([
            mockClient.entities.Appointment.filter({ doctor_email: user.email }),
            mockClient.entities.MedicalRecord.filter({ doctor_email: user.email }),
        ]).then(([appts, recs]) => {
            setAppointments(appts.sort((a, b) => b.date?.localeCompare(a.date)));
            setRecords(recs);
            setLoading(false);
        });
    }, []);

    const filtered = appointments.filter(a => {
        const matchSearch = a.patient_name?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const getRecord = (apptId) => records.find(r => r.appointment_id === apptId);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-48">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl text-sm text-[#F1F5F9] outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {loading ? (
                <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="card-surface h-16 shimmer" />)}</div>
            ) : filtered.length === 0 ? (
                <div className="card-surface"><EmptyState icon={FileText} title="No Consultations" message="Your consultation history will appear here" color="violet" /></div>
            ) : (
                <div className="space-y-2">
                    {filtered.map((appt, i) => {
                        const record = getRecord(appt.id);
                        const isExpanded = expandedId === appt.id;
                        return (
                            <motion.div key={appt.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                className="card-surface overflow-hidden">
                                <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : appt.id)}>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                                        style={{ background: 'rgba(124,58,237,0.15)', color: '#7C3AED' }}>
                                        {appt.patient_name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-[#F1F5F9]">{appt.patient_name}</div>
                                        <div className="text-xs text-[#64748B]">{appt.date} · {appt.start_time}</div>
                                    </div>
                                    <StatusBadge status={appt.status} />
                                    <ChevronDown size={15} color="#64748B" className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                            className="overflow-hidden border-t border-[rgba(255,255,255,0.06)]">
                                            <div className="p-4 space-y-3">
                                                {record ? (
                                                    <>
                                                        <div className="text-xs">
                                                            <span className="text-[#64748B]">Diagnosis: </span>
                                                            <span className="text-[#F1F5F9]">{record.diagnosis || 'N/A'}</span>
                                                        </div>
                                                        <div className="text-xs">
                                                            <span className="text-[#64748B]">Notes: </span>
                                                            <span className="text-[#F1F5F9]">{record.notes || 'No notes added'}</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-xs text-[#64748B]">No medical record linked yet</div>
                                                )}
                                                <div className="flex gap-2 pt-2">
                                                    <button onClick={() => navigate(`/doctor/prescribe?patient=${appt.patient_email}&appt=${appt.id}`)}
                                                        className="text-xs px-3 py-2 rounded-lg font-medium"
                                                        style={{ background: 'rgba(124,58,237,0.15)', color: '#7C3AED' }}>
                                                        Write Prescription
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

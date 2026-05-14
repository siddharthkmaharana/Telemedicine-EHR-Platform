import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, X, FileText } from 'lucide-react';
import StatusBadge from '@/components/medisync/StatusBadge';
import EmptyState from '@/components/medisync/EmptyState';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/api';

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
        const fetchData = async () => {
            try {
                const [apptsRes, recsRes] = await Promise.all([
                    apiClient.get('/appointments/doctor/me'),
                    apiClient.get('/records/doctor/me'),
                ]);
                setAppointments(apptsRes.data.sort((a, b) => b.startTime?.localeCompare(a.startTime)));
                setRecords(recsRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch consultations", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filtered = appointments.filter(a => {
        const patientName = `${a.patientId?.userId?.firstName || ''} ${a.patientId?.userId?.lastName || ''}`;
        const matchSearch = patientName.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const getRecord = (apptId) => records.find(r => r.appointmentId === apptId);

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
                        const record = getRecord(appt._id);
                        const isExpanded = expandedId === appt._id;
                        const patientName = `${appt.patientId?.userId?.firstName || ''} ${appt.patientId?.userId?.lastName || ''}`;
                        return (
                            <motion.div key={appt._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                className="card-surface overflow-hidden">
                                <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : appt._id)}>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                                        style={{ background: 'rgba(124,58,237,0.15)', color: '#7C3AED' }}>
                                        {patientName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-[#F1F5F9]">{patientName}</div>
                                        <div className="text-xs text-[#64748B]">{new Date(appt.startTime).toLocaleString()}</div>
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
                                                    <button onClick={() => navigate(`/doctor/prescribe?patient=${appt.patientId?.userId?._id}&appt=${appt._id}`)}
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

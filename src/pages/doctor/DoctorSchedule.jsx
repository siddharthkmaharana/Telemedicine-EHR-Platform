import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import StatusBadge from '@/components/medisync/StatusBadge';
import { format, addDays, startOfWeek } from 'date-fns';
import apiClient from '@/lib/api';

const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

export default function DoctorSchedule() {
    const [appointments, setAppointments] = useState([]);
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [selectedAppt, setSelectedAppt] = useState(null);
    const user = JSON.parse(localStorage.getItem('medisync_user') || '{}');

    useEffect(() => {
        apiClient.get('/appointments/doctor/me')
            .then(res => setAppointments(res.data))
            .catch(err => console.error(err));
    }, []);

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const getApptForSlot = (date, time) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return appointments.find(a => a.startTime?.startsWith(dateStr) && a.startTime?.includes(`T${time}`));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#F1F5F9]">Weekly Schedule</h2>
                <div className="flex items-center gap-3">
                    <button onClick={() => setWeekStart(w => addDays(w, -7))}
                        className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[rgba(255,255,255,0.08)] transition-all">
                        <ChevronLeft size={16} color="#64748B" />
                    </button>
                    <span className="text-sm font-medium text-[#F1F5F9]">
                        {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                    </span>
                    <button onClick={() => setWeekStart(w => addDays(w, 7))}
                        className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[rgba(255,255,255,0.08)] transition-all">
                        <ChevronRight size={16} color="#64748B" />
                    </button>
                </div>
            </div>

            <div className="card-surface overflow-x-auto">
                <table className="w-full min-w-[700px]">
                    <thead>
                        <tr>
                            <th className="text-xs text-[#64748B] font-medium text-left p-4 w-20">Time</th>
                            {weekDays.map(day => (
                                <th key={format(day, 'yyyy-MM-dd')} className="text-xs font-medium p-4 text-center"
                                    style={{ color: format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? '#7C3AED' : '#64748B' }}>
                                    <div className="text-[10px] uppercase tracking-wider">{format(day, 'EEE')}</div>
                                    <div className={`text-base font-bold mt-0.5 ${format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'text-[#7C3AED]' : 'text-[#F1F5F9]'}`}>
                                        {format(day, 'd')}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {TIME_SLOTS.map(time => (
                            <tr key={time} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                                <td className="p-3 text-xs text-[#64748B]">{time}</td>
                                {weekDays.map(day => {
                                    const appt = getApptForSlot(day, time);
                                    return (
                                        <td key={format(day, 'yyyy-MM-dd')} className="p-1.5">
                                            {appt ? (
                                                <button onClick={() => setSelectedAppt(appt)}
                                                    className="w-full px-2 py-1.5 rounded-lg text-left transition-all hover:scale-105"
                                                    style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
                                                    <div className="text-xs font-medium text-[#F1F5F9] truncate">{appt.patientId?.userId?.firstName} {appt.patientId?.userId?.lastName}</div>
                                                    <div className="mt-0.5"><StatusBadge status={appt.status} size="xs" /></div>
                                                </button>
                                            ) : (
                                                <div className="w-full h-8 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }} />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Appointment Detail Drawer */}
            {selectedAppt && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
                    onClick={() => setSelectedAppt(null)}>
                    <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        className="glass-elevated rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="text-base font-bold text-[#F1F5F9] mb-4">Appointment Details</h3>
                        <div className="space-y-3 text-sm">
                            {[
                                { label: 'Patient', value: `${selectedAppt.patientId?.userId?.firstName} ${selectedAppt.patientId?.userId?.lastName}` },
                                { label: 'Date', value: new Date(selectedAppt.startTime).toLocaleDateString() },
                                { label: 'Time', value: new Date(selectedAppt.startTime).toLocaleTimeString() },
                                { label: 'Chief Complaint', value: selectedAppt.notes || 'N/A' },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between">
                                    <span className="text-[#64748B]">{item.label}</span>
                                    <span className="font-medium text-[#F1F5F9]">{item.value}</span>
                                </div>
                            ))}
                            <div className="pt-2 flex justify-between items-center">
                                <span className="text-[#64748B]">Status</span>
                                <StatusBadge status={selectedAppt.status} />
                            </div>
                        </div>
                        <button onClick={() => setSelectedAppt(null)} className="w-full mt-5 py-2.5 rounded-xl text-sm font-medium"
                            style={{ background: 'rgba(255,255,255,0.08)', color: '#F1F5F9' }}>Close</button>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}

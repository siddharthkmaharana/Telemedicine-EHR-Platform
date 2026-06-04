import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Clock } from 'lucide-react';
import StatusBadge from '@/components/medisync/StatusBadge';
import EmptyState from '@/components/medisync/EmptyState';
import apiClient from '@/lib/api';
import { useNavigate } from 'react-router-dom';

export default function DoctorVideoRooms() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('medisync_user') || '{}');

    useEffect(() => {
        apiClient.get('/appointments/doctor/me')
            .then(res => {
                setAppointments(res.data.filter(a => a.status === 'approved' || a.status === 'confirmed'));
                setLoading(false);
            });
    }, []);

    const startRoom = (apptId) => {
        navigate(`/consultation/${apptId}`);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#7C3AED] rounded-full"></div>
                Video Rooms
            </h2>
            {loading ? (
                <div className="space-y-3">{[1, 2].map(i => <div key={i} className="card-surface h-28 shimmer" />)}</div>
            ) : appointments.length === 0 ? (
                <div className="card-surface">
                    <EmptyState 
                        icon={Video} 
                        title="No Video Appointments" 
                        message="Your confirmed appointments will appear here" 
                        color="violet" 
                        action={null} 
                        actionLabel="" 
                    />
                </div>
            ) : (
                <div className="space-y-4 max-w-2xl">
                    {appointments.map((appt, i) => {
                        const now = new Date();
                        const startTime = new Date(appt.startTime);
                        
                        // Fix: Calculate difference in minutes, accounting for potential timezone shifts
                        const diff = Math.floor((startTime.getTime() - now.getTime()) / 60000);
                        const canStart = diff <= 15 && diff >= -60; // Allow joining 15 mins early
                        return (
                            <motion.div key={appt._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                className="card-surface p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="font-semibold text-[#F1F5F9]">{appt.patientId?.userId?.firstName} {appt.patientId?.userId?.lastName}</div>
                                        <div className="text-xs text-[#94A3B8] mt-0.5 flex items-center gap-1.5"><Clock size={11} />{new Date(appt.startTime).toLocaleString()}</div>
                                    </div>
                                    <StatusBadge status={appt.status} />
                                </div>
                                <div className="flex gap-2">
                                    <motion.button whileHover={canStart ? { scale: 1.02 } : {}} whileTap={canStart ? { scale: 0.97 } : {}}
                                        onClick={() => canStart && startRoom(appt._id)} disabled={!canStart}
                                        className="flex-[2] py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                                        style={{ background: canStart ? '#7C3AED' : 'rgba(255,255,255,0.05)', color: canStart ? '#fff' : '#94A3B8', cursor: canStart ? 'pointer' : 'not-allowed' }}>
                                        <Video size={16} />
                                        {canStart ? 'Start Room' : diff > 10 ? `Opens in ${Math.ceil(diff)} min` : 'Session Ended'}
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                        onClick={() => {
                                            if(window.confirm('Are you sure you want to cancel this appointment?')) {
                                                apiClient.put(`/appointments/${appt._id}/status`, { status: 'cancelled' })
                                                    .then(() => setAppointments(prev => prev.filter(a => a._id !== appt._id)));
                                            }
                                        }}
                                        className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                                        style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                                        Cancel
                                    </motion.button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

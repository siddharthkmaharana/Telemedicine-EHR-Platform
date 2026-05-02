import React, { useEffect, useState, useRef } from 'react';
import { Video, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StatusBadge from '@/components/medisync/StatusBadge';
import EmptyState from '@/components/medisync/EmptyState';
import VideoConsultation from '@/pages/patient/VideoConsultation';
import { motion } from 'framer-motion';

export default function DoctorVideoRooms() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeRoom, setActiveRoom] = useState(null);
    const user = JSON.parse(localStorage.getItem('medisync_user') || '{}');

    useEffect(() => {
        base44.entities.Appointment.filter({ doctor_email: user.email, status: 'confirmed' })
            .then(appts => { setAppointments(appts); setLoading(false); });
    }, []);

    if (activeRoom) {
        return (
            <div className="fixed inset-0 z-50">
                <div className="absolute top-4 left-4 z-50">
                    <button onClick={() => setActiveRoom(null)} className="px-4 py-2 rounded-xl text-sm font-medium"
                        style={{ background: 'rgba(255,255,255,0.15)', color: '#F1F5F9' }}>
                        ← Back
                    </button>
                </div>
                {/* Reuse same VideoRoom component logic */}
                <DoctorVideoRoomUI appointment={activeRoom} onLeave={() => setActiveRoom(null)} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#F1F5F9]">Video Rooms</h2>
            {loading ? (
                <div className="space-y-3">{[1, 2].map(i => <div key={i} className="card-surface h-28 shimmer" />)}</div>
            ) : appointments.length === 0 ? (
                <div className="card-surface"><EmptyState icon={Video} title="No Video Appointments" message="Your confirmed appointments will appear here" color="violet" /></div>
            ) : (
                <div className="space-y-4 max-w-2xl">
                    {appointments.map((appt, i) => {
                        const now = new Date();
                        const startTime = new Date(`${appt.date}T${appt.start_time}`);
                        const diff = (startTime - now) / 60000;
                        const canStart = diff <= 10 && diff >= -60;
                        return (
                            <motion.div key={appt.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                className="card-surface p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="font-semibold text-[#F1F5F9]">{appt.patient_name}</div>
                                        <div className="text-xs text-[#64748B] mt-0.5 flex items-center gap-1.5"><Clock size={11} />{appt.date} at {appt.start_time}</div>
                                    </div>
                                    <StatusBadge status={appt.status} />
                                </div>
                                <motion.button whileHover={canStart ? { scale: 1.02 } : {}} whileTap={canStart ? { scale: 0.97 } : {}}
                                    onClick={() => canStart && setActiveRoom(appt)} disabled={!canStart}
                                    className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                                    style={{ background: canStart ? '#7C3AED' : 'rgba(255,255,255,0.05)', color: canStart ? '#fff' : '#64748B', cursor: canStart ? 'pointer' : 'not-allowed' }}>
                                    <Video size={16} />
                                    {canStart ? 'Start Room' : diff > 10 ? `Opens in ${Math.ceil(diff)} min` : 'Session Ended'}
                                </motion.button>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function DoctorVideoRoomUI({ appointment, onLeave }) {
    const [muted, setMuted] = useState(false);
    const [cameraOff, setCameraOff] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const localVideoRef = React.useRef(null);
    const [stream, setStream] = useState(null);

    React.useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(s => {
            setStream(s);
            if (localVideoRef.current) localVideoRef.current.srcObject = s;
        }).catch(() => { });
        const t = setInterval(() => setElapsed(e => e + 1), 1000);
        return () => { clearInterval(t); stream?.getTracks().forEach(t => t.stop()); };
    }, []);

    const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    return (
        <div className="w-full h-full bg-[#070B14] flex flex-col">
            <div className="glass px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED] animate-pulse" />
                    <span className="text-sm text-[#F1F5F9]">{appointment.patient_name}</span>
                </div>
                <span className="text-sm font-mono text-[#7C3AED]">{fmt(elapsed)}</span>
            </div>
            <div className="flex-1 relative flex items-center justify-center" style={{ background: '#0a0f1a' }}>
                <div className="text-center"><div className="text-[#64748B]">Waiting for patient to join...</div></div>
                <div className="absolute bottom-4 right-4 w-48 h-36 rounded-xl overflow-hidden" style={{ border: '2px solid rgba(255,255,255,0.1)' }}>
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                </div>
            </div>
            <div className="flex items-center justify-center gap-4 py-4">
                <button onClick={() => { setMuted(!muted); stream?.getAudioTracks().forEach(t => t.enabled = muted); }}
                    className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <Video size={18} color="#F1F5F9" />
                </button>
                <button onClick={() => { stream?.getTracks().forEach(t => t.stop()); onLeave(); }}
                    className="w-14 h-12 rounded-full flex items-center justify-center" style={{ background: '#EF4444' }}>
                    <span className="text-white font-bold text-xs">END</span>
                </button>
            </div>
        </div>
    );
}
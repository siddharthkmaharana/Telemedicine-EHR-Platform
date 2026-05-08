import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, Clock, Wifi } from 'lucide-react';
import { mockClient } from '@/lib/mockClient';
import StatusBadge from '@/components/medisync/StatusBadge';
import EmptyState from '@/components/medisync/EmptyState';
import { formatDistanceToNow, parseISO } from 'date-fns';

function VideoRoom({ appointment, onLeave }) {
    const [muted, setMuted] = useState(false);
    const [cameraOff, setCameraOff] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const localVideoRef = useRef(null);
    const [stream, setStream] = useState(null);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(s => {
                setStream(s);
                if (localVideoRef.current) localVideoRef.current.srcObject = s;
            })
            .catch(() => { });
        const timer = setInterval(() => setElapsed(e => e + 1), 1000);
        return () => { clearInterval(timer); stream?.getTracks().forEach(t => t.stop()); };
    }, []);

    const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const handleMute = () => {
        setMuted(!muted);
        stream?.getAudioTracks().forEach(t => t.enabled = muted);
    };
    const handleCamera = () => {
        setCameraOff(!cameraOff);
        stream?.getVideoTracks().forEach(t => t.enabled = cameraOff);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-[#070B14] z-50 flex flex-col">
            {/* Header */}
            <div className="glass px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00D9B8] animate-pulse" />
                    <span className="text-sm font-medium text-[#F1F5F9]">{appointment.doctor_name}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-mono text-[#00D9B8]">{formatTime(elapsed)}</span>
                    <div className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
                        style={{ background: 'rgba(0,217,184,0.1)', color: '#00D9B8' }}>
                        <Wifi size={12} /> Good
                    </div>
                </div>
            </div>

            {/* Main video area */}
            <div className="flex-1 relative flex" style={{ background: '#0a0f1a' }}>
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-4xl h-full max-h-[calc(100vh-120px)] rounded-2xl flex items-center justify-center"
                        style={{ background: '#0E1525' }}>
                        <div className="text-center">
                            <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-3xl"
                                style={{ background: 'rgba(124,58,237,0.2)', color: '#7C3AED' }}>
                                {appointment.doctor_name?.charAt(3) || 'D'}
                            </div>
                            <div className="text-[#64748B] text-sm">Waiting for {appointment.doctor_name} to join...</div>
                            <div className="flex items-center justify-center gap-1.5 mt-3">
                                <div className="w-2 h-2 rounded-full bg-[#F59E0B] animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 rounded-full bg-[#F59E0B] animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 rounded-full bg-[#F59E0B] animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Local video */}
                <div className="absolute bottom-4 right-4 w-48 h-36 rounded-xl overflow-hidden"
                    style={{ border: '2px solid rgba(255,255,255,0.1)' }}>
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }} />
                    {cameraOff && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#0E1525' }}>
                            <VideoOff size={24} color="#64748B" />
                        </div>
                    )}
                </div>

                {/* Chat sidebar */}
                {chatOpen && (
                    <motion.div initial={{ x: 300 }} animate={{ x: 0 }} className="w-72 glass flex flex-col">
                        <div className="p-4 border-b border-[rgba(255,255,255,0.08)]">
                            <span className="text-sm font-semibold text-[#F1F5F9]">Chat</span>
                        </div>
                        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                            {messages.map((m, i) => (
                                <div key={i} className={`text-xs p-2.5 rounded-lg max-w-[90%] ${m.self ? 'ml-auto' : ''}`}
                                    style={{
                                        background: m.self ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)',
                                        color: m.self ? '#F59E0B' : '#F1F5F9'
                                    }}>
                                    {m.text}
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-[rgba(255,255,255,0.08)] flex gap-2">
                            <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && chatInput.trim()) {
                                        setMessages(m => [...m, { text: chatInput, self: true }]);
                                        setChatInput('');
                                    }
                                }}
                                placeholder="Type a message..."
                                className="flex-1 text-xs px-3 py-2 rounded-lg outline-none text-[#F1F5F9] placeholder-[#64748B]"
                                style={{ background: 'rgba(255,255,255,0.08)' }} />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 py-4">
                <button onClick={handleMute}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 ${muted ? 'bg-red-500/20' : 'bg-[rgba(255,255,255,0.1)]'}`}>
                    {muted ? <MicOff size={18} color="#EF4444" /> : <Mic size={18} color="#F1F5F9" />}
                </button>
                <button onClick={handleCamera}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 ${cameraOff ? 'bg-red-500/20' : 'bg-[rgba(255,255,255,0.1)]'}`}>
                    {cameraOff ? <VideoOff size={18} color="#EF4444" /> : <Video size={18} color="#F1F5F9" />}
                </button>
                <button onClick={() => setChatOpen(!chatOpen)}
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: chatOpen ? 'rgba(0,217,184,0.2)' : 'rgba(255,255,255,0.1)' }}>
                    <MessageSquare size={18} color={chatOpen ? '#00D9B8' : '#F1F5F9'} />
                </button>
                <button onClick={() => { stream?.getTracks().forEach(t => t.stop()); onLeave(); }}
                    className="w-14 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: '#EF4444' }}>
                    <PhoneOff size={20} color="#fff" />
                </button>
            </div>
        </motion.div>
    );
}

export default function VideoConsultation() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeRoom, setActiveRoom] = useState(null);
    const user = JSON.parse(localStorage.getItem('medisync_user') || '{}');

    useEffect(() => {
        mockClient.entities.Appointment.filter({ patient_email: user.email })
            .then(appts => {
                setAppointments(appts.filter(a => a.status === 'confirmed'));
                setLoading(false);
            });
    }, []);

    if (activeRoom) return <VideoRoom appointment={activeRoom} onLeave={() => setActiveRoom(null)} />;

    const now = new Date();

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#F1F5F9]">Video Consultations</h2>

            {loading ? (
                <div className="space-y-3">{[1, 2].map(i => <div key={i} className="card-surface h-28 shimmer" />)}</div>
            ) : appointments.length === 0 ? (
                <div className="card-surface">
                    <EmptyState icon={Video} title="No Video Appointments" message="Confirmed appointments will appear here with a join button" color="amber" />
                </div>
            ) : (
                <div className="space-y-4 max-w-2xl">
                    {appointments.map((appt, i) => {
                        const startTime = new Date(`${appt.date}T${appt.start_time}`);
                        const diff = (startTime - now) / 60000;
                        const canJoin = diff <= 10 && diff >= -60;

                        return (
                            <motion.div key={appt.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                className="card-surface p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="font-semibold text-[#F1F5F9]">{appt.doctor_name}</div>
                                        <div className="text-xs text-[#64748B] mt-0.5">{appt.doctor_specialization}</div>
                                    </div>
                                    <StatusBadge status={appt.status} />
                                </div>
                                <div className="flex items-center gap-4 text-sm text-[#64748B] mb-4">
                                    <span className="flex items-center gap-1.5"><Clock size={13} />{appt.date} at {appt.start_time}</span>
                                </div>
                                {!canJoin && diff > 0 && (
                                    <div className="text-sm text-[#F59E0B] mb-3 flex items-center gap-2">
                                        <Clock size={14} />
                                        Starts in {Math.ceil(diff)} minute{Math.ceil(diff) !== 1 ? 's' : ''}
                                    </div>
                                )}
                                <motion.button whileHover={canJoin ? { scale: 1.02 } : {}} whileTap={canJoin ? { scale: 0.97 } : {}}
                                    onClick={() => canJoin && setActiveRoom(appt)}
                                    disabled={!canJoin}
                                    className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                                    style={{
                                        background: canJoin ? '#00D9B8' : 'rgba(255,255,255,0.05)',
                                        color: canJoin ? '#070B14' : '#64748B',
                                        cursor: canJoin ? 'pointer' : 'not-allowed'
                                    }}>
                                    <Video size={16} />
                                    {canJoin ? 'Join Room Now' : diff > 10 ? 'Opens 10 min before' : 'Session Ended'}
                                </motion.button>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

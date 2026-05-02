import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, User } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { format, parseISO } from 'date-fns';

export default function AppointmentCard({ appointment, onJoin, perspective = 'patient', index = 0 }) {
    const now = new Date();
    const startTime = new Date(`${appointment.date}T${appointment.start_time}`);
    const diff = (startTime - now) / 60000; // minutes
    const canJoin = appointment.status === 'confirmed' && diff <= 10 && diff >= -60;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="card-surface p-5 flex flex-col gap-3 hover:border-[rgba(255,255,255,0.12)] transition-all"
        >
            <div className="flex items-start justify-between">
                <div>
                    <div className="font-semibold text-[#F1F5F9]">
                        {perspective === 'patient' ? appointment.doctor_name : appointment.patient_name}
                    </div>
                    <div className="text-xs text-[#64748B] mt-0.5">
                        {perspective === 'patient' ? appointment.doctor_specialization : 'Patient'}
                    </div>
                </div>
                <StatusBadge status={appointment.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-[#64748B]">
                <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {appointment.date ? format(parseISO(appointment.date), 'MMM d, yyyy') : '-'}
                </span>
                <span className="flex items-center gap-1.5">
                    <Clock size={13} />
                    {appointment.start_time}
                </span>
            </div>
            {appointment.chief_complaint && (
                <div className="text-xs text-[#64748B] bg-[rgba(255,255,255,0.04)] rounded-lg px-3 py-2">
                    {appointment.chief_complaint}
                </div>
            )}
            {onJoin && (
                <button
                    onClick={() => onJoin(appointment)}
                    disabled={!canJoin}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${canJoin
                            ? 'bg-[#00D9B8] text-[#070B14] hover:scale-105 active:scale-95 glow-teal'
                            : 'bg-[rgba(255,255,255,0.05)] text-[#64748B] cursor-not-allowed'
                        }`}
                >
                    <Video size={15} />
                    {canJoin ? 'Join Room' : diff > 10 ? `Starts in ${Math.ceil(diff)} min` : 'Session Ended'}
                </button>
            )}
        </motion.div>
    );
}
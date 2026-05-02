import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Star, ChevronLeft, Clock, Calendar, Stethoscope } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format, addDays } from 'date-fns';

const SPECIALIZATIONS = ['Cardiology', 'Dermatology', 'General', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Psychiatry', 'Ophthalmology', 'ENT'];
const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

export default function BookAppointment() {
    const [step, setStep] = useState(1);
    const [specialization, setSpecialization] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [bookedSlots, setBookedSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [chiefComplaint, setChiefComplaint] = useState('');

    const user = JSON.parse(localStorage.getItem('medisync_user') || '{}');

    const today = new Date();
    const dateOptions = Array.from({ length: 14 }, (_, i) => {
        const d = addDays(today, i);
        return format(d, 'yyyy-MM-dd');
    });

    useEffect(() => {
        if (specialization) {
            base44.entities.Doctor.filter({ specialization, is_active: true }).then(setDoctors);
        }
    }, [specialization]);

    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            base44.entities.Appointment.filter({ doctor_email: selectedDoctor.user_email, date: selectedDate })
                .then(appts => setBookedSlots(appts.map(a => a.start_time)));
        }
    }, [selectedDoctor, selectedDate]);

    const handleConfirm = async () => {
        setLoading(true);
        const roomToken = `room_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        await base44.entities.Appointment.create({
            patient_email: user.email,
            patient_name: user.name,
            doctor_email: selectedDoctor.user_email,
            doctor_name: selectedDoctor.full_name,
            doctor_specialization: selectedDoctor.specialization,
            date: selectedDate,
            start_time: selectedTime,
            end_time: `${parseInt(selectedTime.split(':')[0])}:${selectedTime.split(':')[1] === '00' ? '30' : '00'}`,
            status: 'confirmed',
            room_token: roomToken,
            chief_complaint: chiefComplaint,
            duration_minutes: 30,
        });
        setLoading(false);
        setConfirmed(true);
    };

    if (confirmed) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 glow-teal"
                    style={{ background: 'rgba(0,217,184,0.15)', border: '2px solid #00D9B8' }}>
                    <CheckCircle size={40} color="#00D9B8" />
                </div>
                <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">Appointment Confirmed!</h2>
                <p className="text-[#64748B] mb-6">Your appointment has been scheduled successfully</p>
                <div className="card-surface p-6 text-left w-full max-w-sm space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-[#64748B]">Doctor</span>
                        <span className="font-medium text-[#F1F5F9]">{selectedDoctor?.full_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-[#64748B]">Date</span>
                        <span className="font-medium text-[#F1F5F9]">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-[#64748B]">Time</span>
                        <span className="font-medium text-[#F1F5F9]">{selectedTime}</span>
                    </div>
                </div>
                <button onClick={() => { setStep(1); setConfirmed(false); setSpecialization(''); setSelectedDoctor(null); setSelectedDate(''); setSelectedTime(''); }}
                    className="mt-6 px-6 py-3 rounded-xl font-semibold text-sm"
                    style={{ background: '#00D9B8', color: '#070B14' }}>
                    Book Another
                </button>
            </motion.div>
        );
    }

    return (
        <div className="max-w-2xl">
            {/* Progress */}
            <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map(s => (
                    <React.Fragment key={s}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s < step ? 'text-[#070B14]' : s === step ? 'text-[#070B14]' : 'text-[#64748B]'
                            }`} style={{ background: s <= step ? '#F59E0B' : 'rgba(255,255,255,0.08)' }}>
                            {s < step ? <CheckCircle size={14} /> : s}
                        </div>
                        {s < 5 && <div className="flex-1 h-px" style={{ background: s < step ? '#F59E0B' : 'rgba(255,255,255,0.08)' }} />}
                    </React.Fragment>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <h2 className="text-xl font-bold text-[#F1F5F9] mb-2">Select Specialization</h2>
                        <p className="text-sm text-[#64748B] mb-6">What type of doctor do you need?</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {SPECIALIZATIONS.map(spec => (
                                <button key={spec} onClick={() => { setSpecialization(spec); setStep(2); }}
                                    className="p-4 rounded-xl text-sm font-medium text-left transition-all hover:scale-105"
                                    style={{
                                        background: specialization === spec ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${specialization === spec ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.07)'}`,
                                        color: specialization === spec ? '#F59E0B' : '#F1F5F9'
                                    }}>
                                    <Stethoscope size={16} className="mb-2" style={{ color: '#F59E0B' }} />
                                    {spec}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-[#64748B] mb-4 hover:text-[#F1F5F9]">
                            <ChevronLeft size={16} /> Back
                        </button>
                        <h2 className="text-xl font-bold text-[#F1F5F9] mb-2">Select Doctor</h2>
                        <p className="text-sm text-[#64748B] mb-6">{specialization} specialists available</p>
                        {doctors.length === 0 ? (
                            <div className="card-surface p-8 text-center text-[#64748B]">No doctors found for this specialization. Seed data first.</div>
                        ) : (
                            <div className="space-y-3">
                                {doctors.map(doc => (
                                    <button key={doc.id} onClick={() => { setSelectedDoctor(doc); setStep(3); }}
                                        className="w-full card-surface p-5 flex items-center gap-4 text-left hover:border-[rgba(245,158,11,0.3)] transition-all">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
                                            style={{ background: 'rgba(124,58,237,0.2)', color: '#7C3AED' }}>
                                            {doc.full_name?.charAt(0) || 'D'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-[#F1F5F9]">{doc.full_name}</div>
                                            <div className="text-xs text-[#64748B]">{doc.specialization} · {doc.experience_years || 5} years exp</div>
                                            <div className="flex items-center gap-1 mt-1">
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <Star key={i} size={11} fill={i < Math.floor(doc.rating || 4.5) ? '#F59E0B' : 'none'} color="#F59E0B" />
                                                ))}
                                                <span className="text-xs text-[#64748B] ml-1">{doc.rating || 4.5}</span>
                                            </div>
                                        </div>
                                        {doc.available_today && (
                                            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(0,217,184,0.15)', color: '#00D9B8' }}>
                                                Available Today
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <button onClick={() => setStep(2)} className="flex items-center gap-1 text-sm text-[#64748B] mb-4 hover:text-[#F1F5F9]">
                            <ChevronLeft size={16} /> Back
                        </button>
                        <h2 className="text-xl font-bold text-[#F1F5F9] mb-2">Select Date</h2>
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6">
                            {dateOptions.map(date => {
                                const d = new Date(date);
                                return (
                                    <button key={date} onClick={() => { setSelectedDate(date); setStep(4); }}
                                        className="p-3 rounded-xl text-center transition-all hover:scale-105"
                                        style={{
                                            background: selectedDate === date ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                                            border: `1px solid ${selectedDate === date ? '#F59E0B' : 'rgba(255,255,255,0.07)'}`,
                                            color: selectedDate === date ? '#F59E0B' : '#F1F5F9'
                                        }}>
                                        <div className="text-xs text-[#64748B]">{format(d, 'EEE')}</div>
                                        <div className="text-lg font-bold">{format(d, 'd')}</div>
                                        <div className="text-xs">{format(d, 'MMM')}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <button onClick={() => setStep(3)} className="flex items-center gap-1 text-sm text-[#64748B] mb-4 hover:text-[#F1F5F9]">
                            <ChevronLeft size={16} /> Back
                        </button>
                        <h2 className="text-xl font-bold text-[#F1F5F9] mb-2">Select Time</h2>
                        <p className="text-sm text-[#64748B] mb-6">30-minute slots available on {selectedDate}</p>
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            {TIME_SLOTS.map(time => {
                                const isBooked = bookedSlots.includes(time);
                                return (
                                    <button key={time} onClick={() => { if (!isBooked) { setSelectedTime(time); setStep(5); } }}
                                        disabled={isBooked}
                                        className="py-3 rounded-xl text-sm font-medium transition-all"
                                        style={{
                                            background: isBooked ? 'rgba(255,255,255,0.03)' : selectedTime === time ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)',
                                            color: isBooked ? '#3a4252' : selectedTime === time ? '#F59E0B' : '#F1F5F9',
                                            border: `1px solid ${isBooked ? 'rgba(255,255,255,0.04)' : selectedTime === time ? '#F59E0B' : 'rgba(255,255,255,0.07)'}`,
                                            textDecoration: isBooked ? 'line-through' : 'none',
                                            cursor: isBooked ? 'not-allowed' : 'pointer'
                                        }}>
                                        {time}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {step === 5 && (
                    <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <button onClick={() => setStep(4)} className="flex items-center gap-1 text-sm text-[#64748B] mb-4 hover:text-[#F1F5F9]">
                            <ChevronLeft size={16} /> Back
                        </button>
                        <h2 className="text-xl font-bold text-[#F1F5F9] mb-6">Confirm Booking</h2>
                        <div className="card-surface p-6 space-y-4 mb-6">
                            {[
                                { label: 'Doctor', value: selectedDoctor?.full_name },
                                { label: 'Specialization', value: specialization },
                                { label: 'Date', value: selectedDate },
                                { label: 'Time', value: selectedTime },
                                { label: 'Duration', value: '30 minutes' },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between text-sm">
                                    <span className="text-[#64748B]">{item.label}</span>
                                    <span className="font-medium text-[#F1F5F9]">{item.value}</span>
                                </div>
                            ))}
                            <div className="pt-2">
                                <label className="text-xs text-[#64748B] mb-2 block">Chief Complaint (optional)</label>
                                <textarea value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)}
                                    placeholder="Briefly describe your concern..."
                                    rows={3}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none resize-none"
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                            </div>
                        </div>
                        <motion.button onClick={handleConfirm} disabled={loading}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            className="w-full py-4 rounded-xl font-bold text-[#070B14] disabled:opacity-50"
                            style={{ background: '#F59E0B' }}>
                            {loading ? 'Confirming...' : 'Confirm Booking'}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
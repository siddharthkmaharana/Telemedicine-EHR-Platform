import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Pill, FileText, Heart, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/medisync/StatCard';
import AppointmentCard from '@/components/medisync/AppointmentCard';
import EmptyState from '@/components/medisync/EmptyState';
import SkeletonCard from '@/components/medisync/SkeletonCard';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/api';

export default function PatientHome() {
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('medisync_user') || '{}');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [apptsRes, rxsRes, patientsRes] = await Promise.all([
                    apiClient.get('/appointments/patient/me'),
                    apiClient.get('/prescriptions/patient/me'),
                    apiClient.get(`/patients/${user.userId || ''}`),
                ]);
                setAppointments(apptsRes.data);
                setPrescriptions(rxsRes.data);
                setPatient(patientsRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch patient data", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const upcoming = appointments.filter(a => ['confirmed', 'approved', 'pending'].includes(a.status)).slice(0, 3);
    const recentRx = prescriptions.slice(0, 2);
    const activePrescriptions = prescriptions.length; // Simplified for demo

    return (
        <div className="space-y-8">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Calendar} label="Upcoming Appts" value={upcoming.length} delta={0} color="amber" index={0} />
                <StatCard icon={Clock} label="Last Consultation"
                    value={(() => {
                        const completed = appointments.find(a => a.status === 'completed');
                        return completed?.startTime ? format(parseISO(completed.startTime), 'MMM d') : 'N/A';
                    })()}
                    delta={0} color="teal" index={1} />
                <StatCard icon={Pill} label="Active Prescriptions" value={activePrescriptions} delta={0} color="violet" index={2} />
                <StatCard icon={FileText} label="Reports Uploaded" value={0} delta={0} color="teal" index={3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Appointments */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-[#F1F5F9]">Upcoming Appointments</h2>
                        <button onClick={() => navigate('/patient/book')}
                            className="text-xs font-medium text-[#F59E0B] hover:underline">Book New</button>
                    </div>
                    {loading ? (
                        <div className="space-y-3">{[1, 2].map(i => <SkeletonCard key={i} />)}</div>
                    ) : upcoming.length === 0 ? (
                        <div className="card-surface">
                            <EmptyState icon={Calendar} title="No Upcoming Appointments" message="Book your first appointment to get started" color="amber"
                                action={() => navigate('/patient/book')} actionLabel="Book Now" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcoming.map((appt, i) => (
                                <AppointmentCard key={appt._id} appointment={appt} index={i} perspective="patient"
                                    onJoin={() => navigate('/patient/video')} />
                            ))}
                        </div>
                    )}

                    {/* Recent Prescriptions */}
                    <div className="flex items-center justify-between mt-6">
                        <h2 className="text-base font-semibold text-[#F1F5F9]">Recent Prescriptions</h2>
                        <button onClick={() => navigate('/patient/prescriptions')} className="text-xs font-medium text-[#F59E0B] hover:underline">View All</button>
                    </div>
                    {recentRx.length === 0 && !loading ? (
                        <div className="card-surface">
                            <EmptyState icon={Pill} title="No Prescriptions" message="Your prescriptions will appear here" color="amber" action={() => {}} actionLabel="" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentRx.map((rx, i) => (
                                <motion.div key={rx._id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }} className="card-surface p-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-[#F1F5F9]">{rx.diagnosis_summary || 'General Prescription'}</div>
                                        <div className="text-xs text-[#64748B] mt-0.5">{rx.doctorId?.userId?.firstName} {rx.doctorId?.userId?.lastName} · {new Date(rx.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <button className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-105"
                                        style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
                                        Download
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Health Summary */}
                <div className="card-surface p-6 h-fit">
                    <h2 className="text-base font-semibold text-[#F1F5F9] mb-4">Health Summary</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)' }}>
                            <Heart size={16} color="#EF4444" />
                            <div>
                                <div className="text-xs text-[#64748B]">Blood Group</div>
                                <div className="text-sm font-semibold text-[#F1F5F9]">{patient?.blood_group || 'O+'}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)' }}>
                            <AlertTriangle size={16} color="#F59E0B" />
                            <div>
                                <div className="text-xs text-[#64748B]">Allergies</div>
                                <div className="text-sm font-semibold text-[#F1F5F9]">
                                    {patient?.allergies?.join(', ') || 'Penicillin'}
                                </div>
                            </div>
                        </div>
                        <div className="pt-2">
                            <div className="text-xs text-[#64748B] uppercase tracking-wider mb-3">Last Vitals</div>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: 'BP', value: patient?.last_vitals_bp || '120/80' },
                                    { label: 'Pulse', value: patient?.last_vitals_pulse || '72 bpm' },
                                    { label: 'Temp', value: patient?.last_vitals_temp || '98.6°F' },
                                    { label: 'Weight', value: patient?.last_vitals_weight || '70 kg' },
                                ].map(v => (
                                    <div key={v.label} className="p-2.5 rounded-lg text-center"
                                        style={{ background: 'rgba(255,255,255,0.04)' }}>
                                        <div className="text-lg font-bold text-[#00D9B8]">{v.value}</div>
                                        <div className="text-xs text-[#64748B]">{v.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useEffect, useState } from 'react';
import { Calendar, Users, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import StatCard from '@/components/medisync/StatCard';
import StatusBadge from '@/components/medisync/StatusBadge';
import EmptyState from '@/components/medisync/EmptyState';
import apiClient from '@/lib/api';

const HOURS = Array.from({ length: 10 }, (_, i) => `${(9 + i).toString().padStart(2, '0')}:00`);

export default function DoctorHome() {
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('medisync_user') || '{}');
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [apptsRes, rxsRes] = await Promise.all([
                    apiClient.get('/appointments/doctor/me'),
                    apiClient.get('/prescriptions/doctor/me'),
                ]);
                setAppointments(apptsRes.data);
                setPrescriptions(rxsRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const todayAppts = appointments.filter(a => a.startTime?.startsWith(today));
    const pending = appointments.filter(a => a.status === 'pending');
    const uniquePatients = new Set(appointments.map(a => a.patientId?._id || a.patientId)).size;

    const updateStatus = async (id, status) => {
        try {
            await apiClient.put(`/appointments/${id}/status`, { status });
            setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Calendar} label="Appointments Today" value={todayAppts.length} color="violet" index={0} />
                <StatCard icon={Clock} label="Pending Approvals" value={pending.length} color="amber" index={1} />
                <StatCard icon={Users} label="Total Patients" value={uniquePatients} color="teal" index={2} />
                <StatCard icon={FileText} label="Prescriptions Issued" value={prescriptions.length} color="violet" index={3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Schedule */}
                <div className="lg:col-span-2 card-surface p-6">
                    <h2 className="text-base font-semibold text-[#F1F5F9] mb-5">Today's Schedule</h2>
                    {HOURS.map(hour => {
                        const appt = todayAppts.find(a => a.startTime?.includes(`T${hour}`));
                        return (
                            <div key={hour} className="flex gap-3 mb-3">
                                <div className="text-xs text-[#64748B] w-12 pt-1.5 flex-shrink-0">{hour}</div>
                                <div className="flex-1">
                                    {appt ? (
                                        <div className="px-3 py-2 rounded-xl flex items-center justify-between"
                                            style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}>
                                            <span className="text-sm font-medium text-[#F1F5F9]">{appt.patientId?.userId?.firstName} {appt.patientId?.userId?.lastName}</span>
                                            <StatusBadge status={appt.status} />
                                        </div>
                                    ) : (
                                        <div className="px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                            <span className="text-xs text-[#3a4252]">Available</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {todayAppts.length === 0 && !loading && (
                        <div className="text-sm text-[#64748B] text-center py-8">No appointments scheduled for today</div>
                    )}
                </div>

                {/* Pending Approvals */}
                <div className="card-surface p-6">
                    <h2 className="text-base font-semibold text-[#F1F5F9] mb-5">Pending Approvals</h2>
                    {pending.length === 0 ? (
                        <EmptyState icon={CheckCircle} title="All Clear" message="No pending appointment requests" color="violet" />
                    ) : (
                        <div className="space-y-3">
                            {pending.map(appt => (
                                <div key={appt._id} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                    <div className="text-sm font-medium text-[#F1F5F9]">{appt.patientId?.userId?.firstName} {appt.patientId?.userId?.lastName}</div>
                                    <div className="text-xs text-[#64748B] mb-3">{new Date(appt.startTime).toLocaleString()}</div>
                                    <div className="flex gap-2">
                                        <button onClick={() => updateStatus(appt._id, 'approved')}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold"
                                            style={{ background: 'rgba(0,217,184,0.15)', color: '#00D9B8' }}>
                                            <CheckCircle size={12} /> Approve
                                        </button>
                                        <button onClick={() => updateStatus(appt._id, 'cancelled')}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold"
                                            style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>
                                            <XCircle size={12} /> Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

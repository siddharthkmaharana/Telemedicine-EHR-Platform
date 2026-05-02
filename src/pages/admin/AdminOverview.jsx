import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Calendar, Video, FileText, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StatCard from '@/components/medisync/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { format, subDays } from 'date-fns';

const COLORS = ['#00D9B8', '#7C3AED', '#F59E0B', '#EF4444', '#818CF8'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) return (
        <div className="px-3 py-2 rounded-lg text-xs" style={{ background: '#151D2E', border: '1px solid rgba(255,255,255,0.1)', color: '#F1F5F9' }}>
            <div className="font-medium mb-1">{label}</div>
            {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>)}
        </div>
    );
    return null;
};

export default function AdminOverview() {
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            base44.entities.Patient.list(),
            base44.entities.Doctor.list(),
            base44.entities.Appointment.list(),
            base44.entities.Prescription.list(),
            base44.entities.AuditLog.list('-created_date', 10),
        ]).then(([pts, docs, appts, rxs, logs]) => {
            setPatients(pts); setDoctors(docs); setAppointments(appts);
            setPrescriptions(rxs); setAuditLogs(logs); setLoading(false);
        });
    }, []);

    const today = format(new Date(), 'yyyy-MM-dd');
    const todayAppts = appointments.filter(a => a.date === today);

    // Chart data: last 30 days
    const lineData = Array.from({ length: 30 }, (_, i) => {
        const date = format(subDays(new Date(), 29 - i), 'MMM d');
        const dateStr = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd');
        return { date, count: appointments.filter(a => a.date === dateStr).length };
    });

    // Specialization donut
    const specCounts = {};
    appointments.forEach(a => { specCounts[a.doctor_specialization || 'General'] = (specCounts[a.doctor_specialization || 'General'] || 0) + 1; });
    const pieData = Object.entries(specCounts).map(([name, value]) => ({ name, value }));

    // Weekly registrations (mock)
    const barData = Array.from({ length: 8 }, (_, i) => ({
        week: `W${i + 1}`, patients: Math.floor(Math.random() * 20) + 5
    }));

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard icon={Users} label="Total Patients" value={patients.length} color="teal" index={0} />
                <StatCard icon={UserCheck} label="Doctors" value={doctors.length} color="violet" index={1} />
                <StatCard icon={Calendar} label="Appts Today" value={todayAppts.length} color="amber" index={2} />
                <StatCard icon={Video} label="Active Video" value={todayAppts.filter(a => a.status === 'confirmed').length} color="teal" index={3} />
                <StatCard icon={FileText} label="Prescriptions" value={prescriptions.length} color="violet" index={4} />
                <StatCard icon={Activity} label="Uptime" value="99.8%" color="teal" index={5} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Line chart */}
                <div className="card-surface p-6">
                    <h3 className="text-sm font-semibold text-[#F1F5F9] mb-5">Appointments — Last 30 Days</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={lineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false}
                                interval={Math.floor(lineData.length / 6)} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="count" stroke="#00D9B8" strokeWidth={2} dot={false} name="Appointments" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Donut */}
                <div className="card-surface p-6">
                    <h3 className="text-sm font-semibold text-[#F1F5F9] mb-5">Appointments by Specialization</h3>
                    {pieData.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-[#64748B] text-sm">No data available</div>
                    ) : (
                        <div className="flex items-center gap-6">
                            <ResponsiveContainer width="50%" height={180}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2">
                                {pieData.map((item, i) => (
                                    <div key={item.name} className="flex items-center gap-2 text-xs">
                                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                                        <span className="text-[#64748B] truncate max-w-24">{item.name}</span>
                                        <span className="font-medium text-[#F1F5F9] ml-auto">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bar chart + Activity feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-surface p-6">
                    <h3 className="text-sm font-semibold text-[#F1F5F9] mb-5">New Patient Registrations</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="patients" fill="#7C3AED" radius={[4, 4, 0, 0]} name="Patients" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card-surface p-6">
                    <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4">Recent Activity</h3>
                    {auditLogs.length === 0 ? (
                        <div className="text-sm text-[#64748B] text-center py-8">No audit events yet</div>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {auditLogs.map((log, i) => (
                                <motion.div key={log.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                                    className="flex items-center gap-3 p-3 rounded-xl"
                                    style={{ background: log.is_phi ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.04)' }}>
                                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ background: log.action === 'READ' ? '#00D9B8' : log.action === 'WRITE' ? '#7C3AED' : '#EF4444' }} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs text-[#F1F5F9] truncate">{log.description || `${log.action} ${log.resource_type}`}</div>
                                        <div className="text-xs text-[#64748B]">{log.user_email} · {log.user_role}</div>
                                    </div>
                                    <div className="text-xs" style={{ color: log.is_phi ? '#F59E0B' : '#64748B' }}>
                                        {log.is_phi ? '🔒 PHI' : log.action}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
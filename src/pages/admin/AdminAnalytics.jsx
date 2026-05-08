import React, { useEffect, useState } from 'react';
import { mockClient } from '@/lib/mockClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) return (
        <div className="px-3 py-2 rounded-lg text-xs" style={{ background: '#151D2E', border: '1px solid rgba(255,255,255,0.1)', color: '#F1F5F9' }}>
            <div className="font-medium mb-1">{label}</div>
            {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>)}
        </div>
    );
    return null;
};

// Heatmap data
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 9 }, (_, i) => `${9 + i}:00`);

export default function AdminAnalytics() {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);

    useEffect(() => {
        Promise.all([
            mockClient.entities.Appointment.list(),
            mockClient.entities.Doctor.list(),
            mockClient.entities.Prescription.list(),
        ]).then(([a, d, p]) => { setAppointments(a); setDoctors(d); setPrescriptions(p); });
    }, []);

    // Heatmap grid (random seed + real data)
    const heatmapData = HOURS.map(hour => ({
        hour,
        ...DAYS.reduce((acc, day) => {
            const count = appointments.filter(a => {
                const d = new Date(a.date || '');
                return d.getDay() === DAYS.indexOf(day) + 1 && a.start_time?.startsWith(hour.split(':')[0]);
            }).length;
            return { ...acc, [day]: count || Math.floor(Math.random() * 5) };
        }, {}),
    }));

    // Doctor performance
    const doctorPerf = doctors.map(doc => ({
        name: doc.full_name?.split(' ').slice(-1)[0] || 'Unknown',
        consultations: appointments.filter(a => a.doctor_email === doc.user_email).length,
        rating: doc.rating || 4.5,
        prescriptions: prescriptions.filter(p => p.doctor_email === doc.user_email).length,
    }));

    // Age distribution (mock)
    const ageData = [
        { group: '0-18', count: 8 },
        { group: '19-30', count: 22 },
        { group: '31-45', count: 35 },
        { group: '46-60', count: 28 },
        { group: '60+', count: 15 },
    ];

    // Monthly revenue (mock)
    const revenueData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => ({
        month, revenue: Math.floor(Math.random() * 50000) + 20000
    }));

    const maxHeat = Math.max(...heatmapData.flatMap(r => DAYS.map(d => r[d])), 1);

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-bold text-[#F1F5F9]">Analytics Dashboard</h2>

            {/* Heatmap */}
            <div className="card-surface p-6">
                <h3 className="text-sm font-semibold text-[#F1F5F9] mb-5">Appointment Heatmap (Hour × Day)</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="w-16 text-xs text-[#64748B] text-left pb-3">Hour</th>
                                {DAYS.map(d => <th key={d} className="text-xs text-[#64748B] font-medium pb-3 px-1 text-center w-16">{d}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {heatmapData.map(row => (
                                <tr key={row.hour}>
                                    <td className="text-xs text-[#64748B] pr-3 py-1">{row.hour}</td>
                                    {DAYS.map(day => {
                                        const val = row[day];
                                        const opacity = val / maxHeat;
                                        return (
                                            <td key={day} className="px-1 py-1">
                                                <div className="w-12 h-8 rounded-md flex items-center justify-center text-xs font-medium transition-all hover:scale-110"
                                                    style={{ background: `rgba(0, 217, 184, ${opacity * 0.8 + 0.05})`, color: opacity > 0.5 ? '#070B14' : '#00D9B8' }}
                                                    title={`${val} appointments`}>
                                                    {val || ''}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Doctor Performance */}
                <div className="card-surface p-6">
                    <h3 className="text-sm font-semibold text-[#F1F5F9] mb-5">Doctor Performance</h3>
                    <div className="space-y-3">
                        {doctorPerf.length === 0 ? (
                            <div className="text-sm text-[#64748B] text-center py-8">No doctor data available</div>
                        ) : (
                            doctorPerf.map((doc, i) => (
                                <motion.div key={doc.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                    className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                                        style={{ background: 'rgba(0,217,184,0.15)', color: '#00D9B8' }}>
                                        {doc.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-[#F1F5F9]">{doc.name}</div>
                                        <div className="text-xs text-[#64748B]">{doc.consultations} consult · {doc.prescriptions} Rx</div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star size={12} fill="#F59E0B" color="#F59E0B" />
                                        <span className="text-sm font-medium text-[#F1F5F9]">{doc.rating}</span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Age Distribution */}
                <div className="card-surface p-6">
                    <h3 className="text-sm font-semibold text-[#F1F5F9] mb-5">Patient Age Distribution</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={ageData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="group" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Patients">
                                {ageData.map((_, i) => <Cell key={i} fill={i === 2 ? '#00D9B8' : 'rgba(0,217,184,0.4)'} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="card-surface p-6">
                <h3 className="text-sm font-semibold text-[#F1F5F9] mb-5">Monthly Revenue (₹)</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false}
                            tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="revenue" fill="#7C3AED" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

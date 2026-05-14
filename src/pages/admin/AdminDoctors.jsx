import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, Star } from 'lucide-react';
import StatusBadge from '@/components/medisync/StatusBadge';
import EmptyState from '@/components/medisync/EmptyState';
import apiClient from '@/lib/api';

const SPECIALIZATIONS = ['Cardiology', 'Dermatology', 'General Medicine', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Psychiatry'];

export default function AdminDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [confirmDeactivate, setConfirmDeactivate] = useState(null);
    const [newDoc, setNewDoc] = useState({ firstName: '', lastName: '', specialization: 'Cardiology', licenseId: '', consultationFee: 500, isActive: true, rating: 4.5, experienceYears: 5, email: '', password: 'Password123!' });

    useEffect(() => {
        apiClient.get('/doctors').then(res => { setDoctors(res.data); setLoading(false); });
    }, []);

    const addDoctor = async () => {
        try {
            // First create a user, then doctor profile? Or combined endpoint?
            // Assuming the backend has a way to create a doctor with user details.
            // Let's assume a dedicated registration endpoint or handled in controller.
            const res = await apiClient.post('/auth/register', {
                firstName: newDoc.firstName,
                lastName: newDoc.lastName,
                email: newDoc.email,
                password: newDoc.password,
                role: 'doctor',
                specialization: newDoc.specialization,
                licenseId: newDoc.licenseId,
                consultationFee: newDoc.consultationFee,
                experienceYears: newDoc.experienceYears
            });
            setDoctors(d => [res.data.doctor || res.data, ...d]);
            setShowAdd(false);
            setNewDoc({ firstName: '', lastName: '', specialization: 'Cardiology', licenseId: '', consultationFee: 500, isActive: true, rating: 4.5, experienceYears: 5, email: '', password: 'Password123!' });
        } catch (err) {
            console.error("Failed to add doctor", err);
        }
    };

    const toggleStatus = async (doc) => {
        try {
            await apiClient.put(`/doctors/${doc._id}`, { isActive: !doc.isActive });
            setDoctors(d => d.map(item => item._id === doc._id ? { ...item, isActive: !item.isActive } : item));
            setConfirmDeactivate(null);
        } catch (err) {
            console.error("Failed to toggle doctor status", err);
        }
    };

    const filtered = doctors.filter(d => {
        const name = `${d.userId?.firstName || ''} ${d.userId?.lastName || ''}`;
        return name.toLowerCase().includes(search.toLowerCase()) ||
               d.specialization?.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors..."
                        className="pl-9 pr-4 py-2.5 rounded-xl text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none w-64"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <motion.button onClick={() => setShowAdd(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: '#00D9B8', color: '#070B14' }}>
                    <Plus size={15} /> Add Doctor
                </motion.button>
            </div>

            {loading ? (
                <div className="card-surface h-48 shimmer" />
            ) : filtered.length === 0 ? (
                <div className="card-surface"><EmptyState icon={Plus} title="No Doctors Found" message="Add your first doctor to get started" color="teal" action={() => setShowAdd(true)} actionLabel="Add Doctor" /></div>
            ) : (
                <div className="card-surface overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                {['Doctor', 'Specialization', 'License', 'Rating', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-5 py-4 text-xs font-medium uppercase tracking-wider text-[#64748B]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((doc, i) => {
                                const name = `${doc.userId?.firstName || ''} ${doc.userId?.lastName || ''}`;
                                return (
                                    <motion.tr key={doc._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                        className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                                                    style={{ background: 'rgba(0,217,184,0.15)', color: '#00D9B8' }}>
                                                    {name.charAt(0) || 'D'}
                                                </div>
                                                <span className="text-sm font-medium text-[#F1F5F9]">{name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-[#64748B]">{doc.specialization}</td>
                                        <td className="px-5 py-4 text-sm text-[#64748B]">{doc.licenseId || 'N/A'}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1">
                                                <Star size={13} fill="#F59E0B" color="#F59E0B" />
                                                <span className="text-sm text-[#F1F5F9]">{doc.rating || 4.5}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusBadge status={doc.isActive !== false ? 'active' : 'inactive'} />
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setConfirmDeactivate(doc)}
                                                    className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-105"
                                                    style={{
                                                        background: doc.isActive !== false ? 'rgba(239,68,68,0.15)' : 'rgba(0,217,184,0.15)',
                                                        color: doc.isActive !== false ? '#EF4444' : '#00D9B8'
                                                    }}>
                                                    {doc.isActive !== false ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Doctor Drawer */}
            <AnimatePresence>
                {showAdd && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end" onClick={() => setShowAdd(false)}>
                        <motion.div initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="glass-elevated h-full w-full max-w-md p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-[#F1F5F9]">Add Doctor</h3>
                                <button onClick={() => setShowAdd(false)}><X size={18} color="#64748B" /></button>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'First Name', key: 'firstName', type: 'text' },
                                    { label: 'Last Name', key: 'lastName', type: 'text' },
                                    { label: 'Email', key: 'email', type: 'email' },
                                    { label: 'Password', key: 'password', type: 'password' },
                                    { label: 'License ID', key: 'licenseId', type: 'text' },
                                    { label: 'Consultation Fee', key: 'consultationFee', type: 'number' },
                                    { label: 'Experience (Years)', key: 'experienceYears', type: 'number' }
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="text-xs text-[#64748B] mb-1.5 block">{f.label}</label>
                                        <input type={f.type} value={newDoc[f.key]} onChange={e => setNewDoc(d => ({ ...d, [f.key]: f.type === 'number' ? parseFloat(e.target.value) : e.target.value }))}
                                            className="w-full px-3 py-2.5 rounded-xl text-sm text-[#F1F5F9] outline-none"
                                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                                    </div>
                                ))}
                                <div>
                                    <label className="text-xs text-[#64748B] mb-1.5 block">Specialization</label>
                                    <select value={newDoc.specialization} onChange={e => setNewDoc(d => ({ ...d, specialization: e.target.value }))}
                                        className="w-full px-3 py-2.5 rounded-xl text-sm text-[#F1F5F9] outline-none"
                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <motion.button onClick={addDoctor} disabled={!newDoc.firstName || !newDoc.email} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    className="w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-50 mt-4"
                                    style={{ background: '#00D9B8', color: '#070B14' }}>
                                    Add Doctor
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirm Modal */}
            {confirmDeactivate && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDeactivate(null)}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="glass-elevated rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="text-base font-bold text-[#F1F5F9] mb-2">
                            {confirmDeactivate.is_active !== false ? 'Deactivate' : 'Activate'} Doctor
                        </h3>
                        <p className="text-sm text-[#64748B] mb-6">
                            {confirmDeactivate.is_active !== false
                                ? `${confirmDeactivate.full_name} will not be able to accept new appointments.`
                                : `${confirmDeactivate.full_name} will be able to accept appointments again.`}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDeactivate(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                                style={{ background: 'rgba(255,255,255,0.08)', color: '#F1F5F9' }}>Cancel</button>
                            <button onClick={() => toggleStatus(confirmDeactivate)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                                style={{ background: confirmDeactivate.is_active !== false ? '#EF4444' : '#00D9B8', color: confirmDeactivate.is_active !== false ? '#fff' : '#070B14' }}>
                                Confirm
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

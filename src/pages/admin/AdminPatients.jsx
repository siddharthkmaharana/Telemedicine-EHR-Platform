import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Heart, AlertTriangle, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import EmptyState from '@/components/medisync/EmptyState';

export default function AdminPatients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        base44.entities.Patient.list().then(p => { setPatients(p); setLoading(false); });
    }, []);

    const filtered = patients.filter(p =>
        p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.user_email?.toLowerCase().includes(search.toLowerCase())
    );

    const exportCSV = () => {
        const header = 'Name,Email,Blood Group,Allergies,Phone\n';
        const rows = patients.map(p => `${p.full_name},${p.user_email},${p.blood_group || ''},${(p.allergies || []).join(';')},${p.phone || ''}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'patients.csv'; a.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients..."
                        className="pl-9 pr-4 py-2.5 rounded-xl text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none w-64"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <motion.button onClick={exportCSV} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: 'rgba(0,217,184,0.15)', color: '#00D9B8', border: '1px solid rgba(0,217,184,0.3)' }}>
                    <Download size={14} /> Export CSV
                </motion.button>
            </div>

            {loading ? (
                <div className="card-surface h-48 shimmer" />
            ) : filtered.length === 0 ? (
                <div className="card-surface"><EmptyState title="No Patients Found" message="Registered patients will appear here" color="teal" /></div>
            ) : (
                <div className="card-surface overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                {['Patient', 'Email', 'Blood Group', 'Allergies', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-5 py-4 text-xs font-medium uppercase tracking-wider text-[#64748B]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p, i) => (
                                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                    className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                                                style={{ background: 'rgba(0,217,184,0.15)', color: '#00D9B8' }}>
                                                {p.full_name?.charAt(0) || 'P'}
                                            </div>
                                            <span className="text-sm font-medium text-[#F1F5F9]">{p.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-[#64748B]">{p.user_email}</td>
                                    <td className="px-5 py-4 text-sm">
                                        <span className="px-2 py-0.5 rounded-md text-xs font-medium" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>
                                            {p.blood_group || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-[#64748B]">{(p.allergies || []).join(', ') || 'None'}</td>
                                    <td className="px-5 py-4">
                                        <button onClick={() => setSelected(p)}
                                            className="text-xs px-3 py-1.5 rounded-lg font-medium"
                                            style={{ background: 'rgba(0,217,184,0.15)', color: '#00D9B8' }}>
                                            View Record
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <AnimatePresence>
                {selected && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end" onClick={() => setSelected(null)}>
                        <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="glass-elevated h-full w-full max-w-md p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-bold text-[#F1F5F9]">Patient Record</h3>
                                <button onClick={() => setSelected(null)}><X size={18} color="#64748B" /></button>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-xl mb-5" style={{ background: 'rgba(0,217,184,0.08)' }}>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl"
                                    style={{ background: 'rgba(0,217,184,0.2)', color: '#00D9B8' }}>
                                    {selected.full_name?.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-base font-bold text-[#F1F5F9]">{selected.full_name}</div>
                                    <div className="text-sm text-[#64748B]">{selected.user_email}</div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                    <Heart size={14} color="#EF4444" />
                                    <span className="text-xs text-[#64748B]">Blood Group</span>
                                    <span className="text-xs font-medium text-[#F1F5F9] ml-auto">{selected.blood_group || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                    <AlertTriangle size={14} color="#F59E0B" />
                                    <span className="text-xs text-[#64748B]">Allergies</span>
                                    <span className="text-xs font-medium text-[#F1F5F9] ml-auto">{(selected.allergies || []).join(', ') || 'None'}</span>
                                </div>
                                {[
                                    { label: 'Phone', value: selected.phone || 'N/A' },
                                    { label: 'DOB', value: selected.dob || 'N/A' },
                                    { label: 'Address', value: selected.address || 'N/A' },
                                ].map(item => (
                                    <div key={item.label} className="flex justify-between p-3 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                        <span className="text-[#64748B]">{item.label}</span>
                                        <span className="font-medium text-[#F1F5F9]">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
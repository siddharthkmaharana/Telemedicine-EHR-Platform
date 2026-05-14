import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, Shield, Clock } from 'lucide-react';
import apiClient from '@/lib/api';

export default function PatientProfile() {
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const user = JSON.parse(localStorage.getItem('medisync_user') || '{}');

    useEffect(() => {
        apiClient.get(`/patients/${user.userId || ''}`)
            .then(res => {
                setPatient(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            await apiClient.put(`/patients/${patient._id}`, patient);
            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error(err);
            setSaving(false);
        }
    };

    if (loading) return <div className="card-surface h-96 shimmer" />;

    return (
        <div className="max-w-2xl space-y-6">
            <h2 className="text-xl font-bold text-[#F1F5F9]">My Profile</h2>

            {/* Avatar */}
            <div className="card-surface p-6">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-3xl"
                            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.1))', color: '#F59E0B' }}>
                            {patient?.userId?.firstName?.charAt(0) || 'P'}
                        </div>
                        <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: '#F59E0B' }}>
                            <Camera size={13} color="#070B14" />
                        </button>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-[#F1F5F9]">{patient?.userId?.firstName} {patient?.userId?.lastName}</div>
                        <div className="text-sm text-[#64748B]">{patient?.userId?.email}</div>
                    </div>
                </div>
            </div>

            {/* Personal Info */}
            <div className="card-surface p-6 space-y-4">
                <h3 className="text-sm font-semibold text-[#F1F5F9] uppercase tracking-wider">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Blood Group', key: 'bloodGroup', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
                        { label: 'Date of Birth', key: 'dob', type: 'date' },
                        { label: 'Phone', key: 'phone', type: 'tel' },
                    ].map(field => (
                        <div key={field.key}>
                            <label className="text-xs text-[#64748B] uppercase tracking-wider mb-1.5 block">{field.label}</label>
                            {field.type === 'select' ? (
                                <select value={patient?.[field.key] || ''} onChange={e => setPatient(p => ({ ...p, [field.key]: e.target.value }))}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm text-[#F1F5F9] outline-none"
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            ) : (
                                <input type={field.type} value={patient?.[field.key] || ''} onChange={e => setPatient(p => ({ ...p, [field.key]: e.target.value }))}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none"
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                            )}
                        </div>
                    ))}
                </div>
                <div>
                    <label className="text-xs text-[#64748B] uppercase tracking-wider mb-1.5 block">Allergies (comma separated)</label>
                    <input type="text" value={patient?.allergies?.join(', ') || ''} onChange={e => setPatient(p => ({ ...p, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                        className="w-full px-3 py-2.5 rounded-xl text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
            </div>

            {/* Emergency Contact */}
            <div className="card-surface p-6 space-y-4">
                <h3 className="text-sm font-semibold text-[#F1F5F9] uppercase tracking-wider">Emergency Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-[#64748B] mb-1.5 block">Name</label>
                        <input type="text" value={patient?.emergencyContactName || ''} onChange={e => setPatient(p => ({ ...p, emergencyContactName: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-xl text-sm text-[#F1F5F9] outline-none"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>
                    <div>
                        <label className="text-xs text-[#64748B] mb-1.5 block">Phone</label>
                        <input type="tel" value={patient?.emergencyContactPhone || ''} onChange={e => setPatient(p => ({ ...p, emergencyContactPhone: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-xl text-sm text-[#F1F5F9] outline-none"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className="card-surface p-5" style={{ border: '1px solid rgba(0,217,184,0.15)' }}>
                <div className="flex items-center gap-3">
                    <Shield size={16} color="#00D9B8" />
                    <div className="flex-1">
                        <div className="text-sm font-medium text-[#F1F5F9]">Account Security</div>
                        <div className="text-xs text-[#64748B] mt-0.5 flex items-center gap-2">
                            <Clock size={11} />
                            Last login: {new Date(user.loginTime || Date.now()).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            <motion.button onClick={save} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm disabled:opacity-50"
                style={{ background: saved ? '#00D9B8' : '#F59E0B', color: '#070B14' }}>
                <Save size={16} />
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </motion.button>
        </div>
    );
}

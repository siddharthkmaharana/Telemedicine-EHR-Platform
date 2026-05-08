import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload } from 'lucide-react';
import { mockClient } from '@/lib/mockClient';

const SPECIALIZATIONS = ['Cardiology', 'Dermatology', 'General Medicine', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Psychiatry', 'Ophthalmology', 'ENT'];

export default function DoctorProfile() {
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const user = JSON.parse(localStorage.getItem('medisync_user') || '{}');

    useEffect(() => {
        mockClient.entities.Doctor.filter({ user_email: user.email }).then(docs => {
            setDoctor(docs[0] || {
                user_email: user.email, full_name: user.name,
                specialization: 'Cardiology', license_id: 'MCI/2024/001',
                bio: 'Experienced cardiologist with 8+ years of practice.',
                consultation_fee: 500, rating: 4.8, is_active: true,
                available_today: true, experience_years: 8,
            });
            setLoading(false);
        });
    }, []);

    const save = async () => {
        setSaving(true);
        if (doctor.id) await mockClient.entities.Doctor.update(doctor.id, doctor);
        else { const d = await mockClient.entities.Doctor.create(doctor); setDoctor(d); }
        setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
    };

    if (loading) return <div className="card-surface h-96 shimmer" />;

    return (
        <div className="max-w-2xl space-y-6">
            <h2 className="text-xl font-bold text-[#F1F5F9]">My Profile</h2>

            <div className="card-surface p-6 flex items-center gap-5">
                <div className="relative">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-3xl"
                        style={{ background: 'rgba(124,58,237,0.2)', color: '#7C3AED' }}>
                        {doctor?.full_name?.charAt(0) || 'D'}
                    </div>
                </div>
                <div>
                    <div className="text-lg font-bold text-[#F1F5F9]">{doctor?.full_name}</div>
                    <div className="text-sm text-[#64748B]">{doctor?.specialization}</div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(0,217,184,0.15)', color: '#00D9B8' }}>
                            {doctor?.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="card-surface p-6 space-y-4">
                <h3 className="text-sm font-semibold text-[#F1F5F9] uppercase tracking-wider">Professional Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Full Name', key: 'full_name', type: 'text' },
                        { label: 'License ID', key: 'license_id', type: 'text' },
                        { label: 'Experience (Years)', key: 'experience_years', type: 'number' },
                        { label: 'Consultation Fee (₹)', key: 'consultation_fee', type: 'number' },
                    ].map(f => (
                        <div key={f.key}>
                            <label className="text-xs text-[#64748B] mb-1.5 block">{f.label}</label>
                            <input type={f.type} value={doctor?.[f.key] || ''} onChange={e => setDoctor(d => ({ ...d, [f.key]: f.type === 'number' ? parseFloat(e.target.value) : e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-xl text-sm text-[#F1F5F9] outline-none"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                        </div>
                    ))}
                    <div className="col-span-2">
                        <label className="text-xs text-[#64748B] mb-1.5 block">Specialization</label>
                        <select value={doctor?.specialization || ''} onChange={e => setDoctor(d => ({ ...d, specialization: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-xl text-sm text-[#F1F5F9] outline-none"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs text-[#64748B] mb-1.5 block">Bio</label>
                        <textarea rows={3} value={doctor?.bio || ''} onChange={e => setDoctor(d => ({ ...d, bio: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-xl text-sm text-[#F1F5F9] outline-none resize-none"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <label className="text-sm text-[#F1F5F9]">Available Today</label>
                    <button onClick={() => setDoctor(d => ({ ...d, available_today: !d.available_today }))}
                        className="relative w-11 h-6 rounded-full transition-all"
                        style={{ background: doctor?.available_today ? '#7C3AED' : 'rgba(255,255,255,0.15)' }}>
                        <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                            style={{ left: doctor?.available_today ? '1.375rem' : '0.125rem' }} />
                    </button>
                </div>
            </div>

            <div className="card-surface p-5">
                <button className="flex items-center gap-2 text-sm font-medium" style={{ color: '#7C3AED' }}>
                    <Upload size={15} /> Upload Medical Council Certificate
                </button>
            </div>

            <motion.button onClick={save} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
                style={{ background: saved ? '#00D9B8' : '#7C3AED', color: '#fff' }}>
                <Save size={16} />
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </motion.button>
        </div>
    );
}

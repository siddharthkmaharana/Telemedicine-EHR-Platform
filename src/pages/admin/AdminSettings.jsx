import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, AlertTriangle, Shield, Bell, Clock, Building2 } from 'lucide-react';
import { mockClient } from '@/lib/mockClient';

export default function AdminSettings() {
    const [settings, setSettings] = useState({
        clinic_name: 'MediSync Health Center',
        address: '123 Health Street, Medical District',
        phone: '+91-9876543210',
        email: 'admin@medisync.com',
        working_hours_start: '09:00',
        working_hours_end: '18:00',
        session_timeout_minutes: 30,
        two_fa_enabled: false,
        email_reminders_enabled: true,
        reminder_hours_before: 24,
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [settingId, setSettingId] = useState(null);

    useEffect(() => {
        mockClient.entities.ClinicSettings.list().then(s => {
            if (s.length > 0) { setSettings(s[0]); setSettingId(s[0].id); }
        });
    }, []);

    const save = async () => {
        setSaving(true);
        if (settingId) {
            await mockClient.entities.ClinicSettings.update(settingId, settings);
        } else {
            const created = await mockClient.entities.ClinicSettings.create(settings);
            setSettingId(created.id);
        }
        setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
    };

    const Section = ({ title, icon: SectionIcon, children }) => (
        <div className="card-surface p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <SectionIcon size={16} color="#00D9B8" />
                <h3 className="text-sm font-semibold text-[#F1F5F9] uppercase tracking-wider">{title}</h3>
            </div>
            {children}
        </div>
    );

    const Field = ({ label, field, type = 'text' }) => (
        <div>
            <label className="text-xs text-[#64748B] mb-1.5 block">{label}</label>
            <input type={type} value={settings[field] || ''} onChange={e => setSettings(s => ({ ...s, [field]: type === 'number' ? parseInt(e.target.value) : e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-[#F1F5F9] outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
    );

    const Toggle = ({ label, field, sublabel }) => (
        <div className="flex items-center justify-between py-2">
            <div>
                <div className="text-sm text-[#F1F5F9]">{label}</div>
                {sublabel && <div className="text-xs text-[#64748B]">{sublabel}</div>}
            </div>
            <button onClick={() => setSettings(s => ({ ...s, [field]: !s[field] }))}
                className="relative w-11 h-6 rounded-full transition-all"
                style={{ background: settings[field] ? '#00D9B8' : 'rgba(255,255,255,0.15)' }}>
                <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                    style={{ left: settings[field] ? '1.375rem' : '0.125rem' }} />
            </button>
        </div>
    );

    return (
        <div className="max-w-2xl space-y-6">
            <h2 className="text-xl font-bold text-[#F1F5F9]">Platform Settings</h2>

            <Section title="Clinic Details" icon={Building2}>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Clinic Name" field="clinic_name" />
                    <Field label="Phone" field="phone" type="tel" />
                </div>
                <Field label="Address" field="address" />
                <Field label="Contact Email" field="email" type="email" />
            </Section>

            <Section title="Working Hours" icon={Clock}>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Opens At" field="working_hours_start" type="time" />
                    <Field label="Closes At" field="working_hours_end" type="time" />
                </div>
            </Section>

            <Section title="Notifications" icon={Bell}>
                <Toggle label="Email Reminders" field="email_reminders_enabled" sublabel="Send appointment reminders via email" />
                <Field label="Reminder Hours Before Appointment" field="reminder_hours_before" type="number" />
            </Section>

            <Section title="Security" icon={Shield}>
                <Field label="Session Timeout (minutes)" field="session_timeout_minutes" type="number" />
                <Toggle label="Two-Factor Authentication" field="two_fa_enabled" sublabel="Require 2FA for all admin logins (UI only)" />
            </Section>

            {/* Danger Zone */}
            <div className="rounded-xl p-6" style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={16} color="#EF4444" />
                    <h3 className="text-sm font-semibold text-[#EF4444] uppercase tracking-wider">Danger Zone</h3>
                </div>
                <p className="text-xs text-[#64748B] mb-4">These actions are irreversible. Proceed with caution.</p>
                <button className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
                    onClick={() => alert('Demo mode: Reset not available')}>
                    Reset Demo Data
                </button>
            </div>

            <motion.button onClick={save} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
                style={{ background: saved ? '#00D9B8' : '#00D9B8', color: '#070B14' }}>
                <Save size={16} />
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
            </motion.button>
        </div>
    );
}

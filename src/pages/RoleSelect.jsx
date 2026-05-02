import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, User, Shield, Zap, Eye, EyeOff } from 'lucide-react';

const ROLES = [
    { id: 'patient', label: 'Patient', icon: User, color: '#F59E0B', desc: 'Book appointments, view health records' },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, color: '#7C3AED', desc: 'Manage schedule, write prescriptions' },
    { id: 'admin', label: 'Admin', icon: Shield, color: '#00D9B8', desc: 'Platform overview and management' },
];

const DEMO_ACCOUNTS = {
    patient: { email: 'patient@medisync.com', password: 'Demo@123' },
    doctor: { email: 'doctor@medisync.com', password: 'Demo@123' },
    admin: { email: 'admin@medisync.com', password: 'Demo@123' },
};

export default function RoleSelect() {
    const [activeRole, setActiveRole] = useState('patient');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const roleConfig = ROLES.find(r => r.id === activeRole);

    const doLogin = (emailVal, passwordVal, roleHint) => {
        const expectedEmails = {
            patient: 'patient@medisync.com',
            doctor: 'doctor@medisync.com',
            admin: 'admin@medisync.com',
        };
        // Find role by email
        let role = roleHint;
        if (!role) {
            role = Object.keys(expectedEmails).find(r => expectedEmails[r] === emailVal);
        }
        if (!role) { setError('User not found'); setLoading(false); return; }
        if (passwordVal !== 'Demo@123') { setError('Invalid password'); setLoading(false); return; }
        const userData = { email: emailVal, role, name: role === 'patient' ? 'Ajay Sharma' : role === 'doctor' ? 'Dr. Samay Shukla' : 'System Admin' };
        localStorage.setItem('medisync_user', JSON.stringify(userData));
        navigate(`/${role}`);
    };

    const handleLogin = (e) => {
        e?.preventDefault();
        setError('');
        setLoading(true);
        setTimeout(() => doLogin(email, password, null), 700);
    };

    const handleDemoLogin = (role) => {
        const demo = DEMO_ACCOUNTS[role];
        setActiveRole(role);
        setEmail(demo.email);
        setPassword(demo.password);
        setError('');
        setLoading(true);
        setTimeout(() => doLogin(demo.email, demo.password, role), 800);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
            style={{ background: '#070B14' }}>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-8 blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, #00D9B8, transparent)' }} />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />

            <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: '#00D9B8' }}>
                        <Stethoscope size={22} color="#070B14" />
                    </div>
                    <span className="text-2xl font-bold text-[#F1F5F9]">MediSync</span>
                </div>

                <div className="glass-elevated rounded-2xl p-8">
                    <h2 className="text-lg font-semibold text-[#F1F5F9] text-center mb-1">Welcome back</h2>
                    <p className="text-sm text-[#64748B] text-center mb-6">Sign in to your account</p>

                    {/* Role tabs */}
                    <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        {ROLES.map(role => (
                            <button key={role.id} onClick={() => setActiveRole(role.id)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-200"
                                style={{
                                    background: activeRole === role.id ? role.color + '20' : 'transparent',
                                    color: activeRole === role.id ? role.color : '#64748B',
                                    border: activeRole === role.id ? `1px solid ${role.color}40` : '1px solid transparent',
                                }}>
                                <role.icon size={13} />
                                {role.label}
                            </button>
                        ))}
                    </div>

                    <div className="text-center mb-5">
                        <span className="text-xs font-medium px-3 py-1 rounded-full"
                            style={{ background: `${roleConfig.color}15`, color: roleConfig.color }}>
                            Signing in as {roleConfig.label}
                        </span>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-[#64748B] uppercase tracking-wider mb-1.5">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder={`${activeRole}@medisync.com`}
                                className="w-full px-4 py-3 rounded-xl text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#64748B] uppercase tracking-wider mb-1.5">Password</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 rounded-xl text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none pr-12"
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#F1F5F9]">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="text-red-400 text-sm px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button type="submit" disabled={loading || !email || !password}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            className="w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: roleConfig.color, color: '#070B14' }}>
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-[#070B14] border-t-transparent rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </motion.button>
                    </form>

                    {/* Demo quick login */}
                    <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <Zap size={13} color="#64748B" />
                            <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider">Quick Demo Login</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {ROLES.map(role => (
                                <motion.button key={role.id} onClick={() => handleDemoLogin(role.id)}
                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    className="py-2.5 rounded-xl text-xs font-semibold transition-all"
                                    style={{ background: `${role.color}15`, color: role.color, border: `1px solid ${role.color}30` }}>
                                    {role.label}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
                <p className="text-center text-xs text-[#64748B] mt-4">Password for all demo accounts: <span className="text-[#F1F5F9]">Demo@123</span></p>
            </motion.div>
        </div>
    );
}
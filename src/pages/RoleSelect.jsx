import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, User, Shield, Eye, EyeOff } from 'lucide-react';

const ROLES = [
    { id: 'patient', label: 'Patient', icon: User, color: '#F59E0B', desc: 'Book appointments, view health records' },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, color: '#7C3AED', desc: 'Manage schedule, write prescriptions' },
    { id: 'admin', label: 'Admin', icon: Shield, color: '#00D9B8', desc: 'Platform overview and management' },
];

export default function RoleSelect() {
    const [activeRole, setActiveRole] = useState('patient');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const roleConfig = ROLES.find(r => r.id === activeRole);

    const doLogin = async (emailVal, passwordVal, roleHint) => {
        try {
            const { default: api } = await import('@/lib/api');
            const response = await api.post('/auth/login', { email: emailVal, password: passwordVal });
            const { token, user } = response.data;
            
            localStorage.setItem('medisync_user', JSON.stringify({ ...user, token }));
            localStorage.setItem('token', token); // Keep for legacy if needed
            
            navigate(`/${user.role}`);
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.response?.data?.message || 'Invalid credentials or server error');
            setLoading(false);
        }
    };

    const doSignup = async () => {
        try {
            const { default: api } = await import('@/lib/api');
            await api.post('/auth/register', { 
                email, password, role: activeRole, firstName, lastName 
            });
            await doLogin(email, password, activeRole);
        } catch (err) {
            console.error('Signup failed:', err);
            setError(err.response?.data?.message || 'Signup failed');
            setLoading(false);
        }
    };

    const handleLogin = (e) => {
        e?.preventDefault();
        setError('');
        setLoading(true);
        if (isSignup) {
            setTimeout(() => doSignup(), 700);
        } else {
            setTimeout(() => doLogin(email, password, null), 700);
        }
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
                    <h2 className="text-lg font-semibold text-[#F1F5F9] text-center mb-1">{isSignup ? 'Create Account' : 'Welcome back'}</h2>
                    <p className="text-sm text-[#94A3B8] text-center mb-6">{isSignup ? 'Sign up for a new account' : 'Sign in to your account'}</p>

                    {/* Role tabs */}
                    <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        {ROLES.map(role => (
                            <button key={role.id} onClick={() => { setActiveRole(role.id); if (role.id !== 'patient') setIsSignup(false); }}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-200"
                                style={{
                                    background: activeRole === role.id ? role.color + '20' : 'transparent',
                                    color: activeRole === role.id ? role.color : '#94A3B8',
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
                        {isSignup && (
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-1.5">First Name</label>
                                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                                        placeholder="John" required={isSignup}
                                        className="w-full px-4 py-3 rounded-xl text-sm text-[#F1F5F9] placeholder-[#94A3B8] outline-none"
                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-1.5">Last Name</label>
                                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                                        placeholder="Doe" required={isSignup}
                                        className="w-full px-4 py-3 rounded-xl text-sm text-[#F1F5F9] placeholder-[#94A3B8] outline-none"
                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-1.5">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder={`${activeRole}@medisync.com`}
                                className="w-full px-4 py-3 rounded-xl text-sm text-[#F1F5F9] placeholder-[#94A3B8] outline-none"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-1.5">Password</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 rounded-xl text-sm text-[#F1F5F9] placeholder-[#94A3B8] outline-none pr-12"
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F1F5F9]">
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
                                    {isSignup ? 'Signing up...' : 'Signing in...'}
                                </span>
                            ) : (isSignup ? 'Sign Up' : 'Sign In')}
                        </motion.button>
                        
                        {activeRole === 'patient' && (
                            <div className="text-center mt-4">
                                <p className="text-sm text-[#94A3B8]">
                                    {isSignup ? "Already have an account? " : "Don't have an account? "}
                                    <button type="button" onClick={() => setIsSignup(!isSignup)} className="font-semibold hover:underline" style={{ color: roleConfig.color }}>
                                        {isSignup ? 'Sign in' : 'Sign up'}
                                    </button>
                                </p>
                            </div>
                        )}
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut, Stethoscope } from 'lucide-react';
import { useMediSync } from '@/lib/MediSyncContext';

export default function Sidebar({ navItems, accentColor = '#00D9B8', role = 'patient' }) {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const { currentUser, logout } = useMediSync();

    const roleBadgeColors = {
        patient: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
        doctor: { bg: 'rgba(124,58,237,0.15)', text: '#7C3AED' },
        admin: { bg: 'rgba(0,217,184,0.15)', text: '#00D9B8' },
    };
    const rb = roleBadgeColors[role];

    return (
        <motion.div
            animate={{ width: collapsed ? 72 : 240 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="glass fixed left-0 top-0 h-full z-40 flex flex-col py-6 overflow-hidden"
            style={{ minWidth: collapsed ? 72 : 240 }}
        >
            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 mb-8 ${collapsed ? 'justify-center' : ''}`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: accentColor }}>
                    <Stethoscope size={18} color="#070B14" />
                </div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="font-bold text-lg text-[#F1F5F9]"
                        >
                            MediSync
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-3 space-y-1">
                {navItems.map((item, i) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <motion.div key={item.path} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                            <Link
                                to={item.path}
                                className={`sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`}
                                style={isActive ? { background: `${accentColor}15`, color: accentColor, borderLeft: `2px solid ${accentColor}` } : {}}
                                title={collapsed ? item.label : ''}
                            >
                                <item.icon size={18} style={{ flexShrink: 0, color: isActive ? accentColor : undefined }} />
                                <AnimatePresence>
                                    {!collapsed && (
                                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Link>
                        </motion.div>
                    );
                })}
            </nav>

            {/* User info + logout */}
            <div className="px-3 space-y-2 mt-4">
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                            <div className="text-xs font-medium text-[#F1F5F9] truncate">{currentUser?.name}</div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-xs px-1.5 py-0.5 rounded-md capitalize font-medium"
                                    style={{ background: rb.bg, color: rb.text }}>
                                    {role}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={logout}
                    className={`sidebar-item w-full ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? 'Logout' : ''}
                >
                    <LogOut size={18} style={{ flexShrink: 0 }} />
                    <AnimatePresence>
                        {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Logout</motion.span>}
                    </AnimatePresence>
                </button>
            </div>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-8 w-6 h-6 rounded-full flex items-center justify-center z-50 transition-all hover:scale-110"
                style={{ background: '#151D2E', border: '1px solid rgba(255,255,255,0.12)' }}
            >
                {collapsed ? <ChevronRight size={12} color="#64748B" /> : <ChevronLeft size={12} color="#64748B" />}
            </button>
        </motion.div>
    );
}

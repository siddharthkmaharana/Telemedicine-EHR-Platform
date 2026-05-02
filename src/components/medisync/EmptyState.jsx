import React from 'react';
import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, message, action, actionLabel, color = 'teal' }) {
    const colorMap = {
        teal: { text: '#00D9B8', bg: 'rgba(0,217,184,0.1)' },
        violet: { text: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
        amber: { text: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    };
    const c = colorMap[color] || colorMap.teal;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 px-8 text-center"
        >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: c.bg }}>
                {Icon && <Icon size={28} style={{ color: c.text }} />}
            </div>
            <h3 className="text-lg font-semibold text-[#F1F5F9] mb-2">{title}</h3>
            <p className="text-sm text-[#64748B] max-w-xs leading-relaxed mb-6">{message}</p>
            {action && (
                <button
                    onClick={action}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                    style={{ background: c.text, color: '#070B14' }}
                >
                    {actionLabel}
                </button>
            )}
        </motion.div>
    );
}
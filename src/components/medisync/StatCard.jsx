import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, delta, color = 'teal', index = 0 }) {
    const [displayValue, setDisplayValue] = useState(0);
    const numericValue = parseInt(value?.toString().replace(/\D/g, '')) || 0;
    const isString = isNaN(parseInt(value));

    useEffect(() => {
        if (isString) return;
        let start = 0;
        const end = numericValue;
        if (end === 0) { setDisplayValue(0); return; }
        const duration = 1200;
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) { setDisplayValue(end); clearInterval(timer); }
            else setDisplayValue(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [numericValue]);

    const colorMap = {
        teal: { bg: 'rgba(0,217,184,0.1)', text: '#00D9B8', border: 'rgba(0,217,184,0.2)' },
        violet: { bg: 'rgba(124,58,237,0.1)', text: '#7C3AED', border: 'rgba(124,58,237,0.2)' },
        amber: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B', border: 'rgba(245,158,11,0.2)' },
        red: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444', border: 'rgba(239,68,68,0.2)' },
    };
    const c = colorMap[color] || colorMap.teal;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
            className="card-surface p-6 relative overflow-hidden"
        >
            <div className="absolute inset-0 opacity-40" style={{
                background: `radial-gradient(ellipse at top right, ${c.bg} 0%, transparent 70%)`
            }} />
            <div className="relative">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 rounded-xl" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                        <Icon size={18} style={{ color: c.text }} />
                    </div>
                    {delta && (
                        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${delta.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                            {delta.startsWith('+') ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {delta}
                        </div>
                    )}
                </div>
                <div className="text-3xl font-bold mb-1" style={{ color: c.text }}>
                    {isString ? value : displayValue}
                </div>
                <div className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                    {label}
                </div>
            </div>
        </motion.div>
    );
}

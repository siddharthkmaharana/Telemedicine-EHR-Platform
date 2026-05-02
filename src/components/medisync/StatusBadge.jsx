import React from 'react';

const config = {
    pending: { label: 'Pending', bg: 'rgba(245,158,11,0.15)', text: '#F59E0B', dot: '#F59E0B' },
    confirmed: { label: 'Confirmed', bg: 'rgba(0,217,184,0.15)', text: '#00D9B8', dot: '#00D9B8' },
    completed: { label: 'Completed', bg: 'rgba(99,102,241,0.15)', text: '#818CF8', dot: '#818CF8' },
    cancelled: { label: 'Cancelled', bg: 'rgba(239,68,68,0.15)', text: '#EF4444', dot: '#EF4444' },
    active: { label: 'Active', bg: 'rgba(0,217,184,0.15)', text: '#00D9B8', dot: '#00D9B8' },
    inactive: { label: 'Inactive', bg: 'rgba(100,116,139,0.15)', text: '#94A3B8', dot: '#94A3B8' },
    expired: { label: 'Expired', bg: 'rgba(239,68,68,0.15)', text: '#EF4444', dot: '#EF4444' },
};

export default function StatusBadge({ status, size = 'sm' }) {
    const c = config[status] || config.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full ${size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'}`}
            style={{ background: c.bg, color: c.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
            {c.label}
        </span>
    );
}
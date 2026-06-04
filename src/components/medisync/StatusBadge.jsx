import React from 'react';

const config = {
    pending: { label: 'Pending', bg: 'rgba(245,158,11,0.2)', text: '#FFB83D', dot: '#FFB83D' },
    approved: { label: 'Approved', bg: 'rgba(0,217,184,0.2)', text: '#00F5D0', dot: '#00F5D0' },
    confirmed: { label: 'Confirmed', bg: 'rgba(0,217,184,0.2)', text: '#00F5D0', dot: '#00F5D0' },
    completed: { label: 'Completed', bg: 'rgba(99,102,241,0.2)', text: '#A5B4FC', dot: '#A5B4FC' },
    cancelled: { label: 'Cancelled', bg: 'rgba(239,68,68,0.2)', text: '#FF6B6B', dot: '#FF6B6B' },
    active: { label: 'Active', bg: 'rgba(0,217,184,0.2)', text: '#00F5D0', dot: '#00F5D0' },
    inactive: { label: 'Inactive', bg: 'rgba(100,116,139,0.2)', text: '#CBD5E1', dot: '#CBD5E1' },
    expired: { label: 'Expired', bg: 'rgba(239,68,68,0.2)', text: '#FF6B6B', dot: '#FF6B6B' },
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

import React from 'react';
import { Bell } from 'lucide-react';
import { useMediSync } from '@/lib/MediSyncContext';

export default function TopBar({ title, subtitle }) {
    const { currentUser } = useMediSync();
    const initials = currentUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

    return (
        <div className="glass sticky top-0 z-30 px-8 py-4 flex items-center justify-between"
            style={{ marginLeft: 0 }}>
            <div>
                <h1 className="text-xl font-bold text-[#F1F5F9]">{title}</h1>
                {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
                <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-[rgba(255,255,255,0.08)]">
                    <Bell size={16} color="#64748B" />
                </button>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #00D9B8, #7C3AED)', color: '#fff' }}>
                    {initials}
                </div>
            </div>
        </div>
    );
}

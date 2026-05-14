import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Download, Search } from 'lucide-react';
import apiClient from '@/lib/api';
import EmptyState from '@/components/medisync/EmptyState';

const ACTION_COLORS = {
    READ: { bg: 'rgba(0,217,184,0.12)', text: '#00D9B8' },
    WRITE: { bg: 'rgba(124,58,237,0.12)', text: '#7C3AED' },
    DELETE: { bg: 'rgba(239,68,68,0.12)', text: '#EF4444' },
    LOGIN: { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B' },
    LOGOUT: { bg: 'rgba(100,116,139,0.12)', text: '#94A3B8' },
    EXPORT: { bg: 'rgba(0,217,184,0.12)', text: '#00D9B8' },
};

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [actionFilter, setActionFilter] = useState('all');

    useEffect(() => {
        apiClient.get('/audit').then(res => { setLogs(res.data); setLoading(false); }).catch(err => { console.error(err); setLoading(false); });
    }, []);

    const filtered = logs.filter(l => {
        const email = l.userId?.email || l.user_email || '';
        const role = l.userId?.role || l.user_role || '';
        const matchSearch = email.toLowerCase().includes(search.toLowerCase()) ||
            l.description?.toLowerCase().includes(search.toLowerCase()) ||
            l.resourceType?.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || role === roleFilter;
        const matchAction = actionFilter === 'all' || l.action === actionFilter;
        return matchSearch && matchRole && matchAction;
    });

    const exportCSV = () => {
        const rows = ['Timestamp,User,Role,Action,Resource,Description,IP,PHI']
            .concat(filtered.map(l => `${l.timestamp || l.created_date},${l.userId?.email || ''},${l.userId?.role || ''},${l.action},${l.resourceType || ''},${l.description || ''},${l.ipAddress || ''},${l.isPhi || false}`))
            .join('\n');
        const blob = new Blob([rows], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'audit_logs.csv'; a.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..."
                            className="pl-9 pr-4 py-2.5 rounded-xl text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none w-52"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                        className="px-3 py-2.5 rounded-xl text-sm text-[#F1F5F9] outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <option value="all">All Roles</option>
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                        <option value="admin">Admin</option>
                    </select>
                    <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
                        className="px-3 py-2.5 rounded-xl text-sm text-[#F1F5F9] outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <option value="all">All Actions</option>
                        <option value="READ">READ</option>
                        <option value="WRITE">WRITE</option>
                        <option value="DELETE">DELETE</option>
                        <option value="LOGIN">LOGIN</option>
                    </select>
                </div>
                <motion.button onClick={exportCSV} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: 'rgba(0,217,184,0.15)', color: '#00D9B8', border: '1px solid rgba(0,217,184,0.3)' }}>
                    <Download size={14} /> Export CSV
                </motion.button>
            </div>

            {loading ? (
                <div className="card-surface h-48 shimmer" />
            ) : filtered.length === 0 ? (
                <div className="card-surface">
                    <EmptyState icon={Shield} title="No Audit Logs" message="Audit events will be logged here automatically" color="teal" />
                </div>
            ) : (
                <div className="card-surface overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                {['Timestamp', 'User', 'Role', 'Action', 'Resource', 'Description', 'IP'].map(h => (
                                    <th key={h} className="text-left px-5 py-4 text-xs font-medium uppercase tracking-wider text-[#64748B]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((log, i) => {
                                const ac = ACTION_COLORS[log.action] || ACTION_COLORS.READ;
                                const email = log.userId?.email || log.user_email || '';
                                const role = log.userId?.role || log.user_role || '';
                                const timestamp = log.timestamp || log.created_date;
                                return (
                                    <motion.tr key={log._id || log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.02, 0.5) }}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: log.isPhi || log.is_phi ? 'rgba(245,158,11,0.04)' : 'transparent' }}
                                        className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                        <td className="px-5 py-3.5 text-xs text-[#64748B] font-mono whitespace-nowrap">
                                            {timestamp ? new Date(timestamp).toLocaleString() : '—'}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="text-xs font-medium text-[#F1F5F9]">{email}</div>
                                            {(log.isPhi || log.is_phi) && <span className="text-xs text-[#F59E0B]">🔒 PHI Access</span>}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-xs px-2 py-0.5 rounded-md capitalize font-medium"
                                                style={{
                                                    background: role === 'doctor' ? 'rgba(124,58,237,0.15)' : role === 'patient' ? 'rgba(245,158,11,0.15)' : 'rgba(0,217,184,0.15)',
                                                    color: role === 'doctor' ? '#7C3AED' : role === 'patient' ? '#F59E0B' : '#00D9B8'
                                                }}>
                                                {role}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-xs px-2 py-1 rounded-md font-semibold" style={{ background: ac.bg, color: ac.text }}>{log.action}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-[#64748B]">{log.resourceType || log.resource_type}</td>
                                        <td className="px-5 py-3.5 text-xs text-[#64748B] max-w-xs truncate">{log.description || '—'}</td>
                                        <td className="px-5 py-3.5 text-xs text-[#64748B] font-mono">{log.ipAddress || log.ip_address || '127.0.0.1'}</td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

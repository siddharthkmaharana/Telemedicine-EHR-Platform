import React from 'react';
import { Outlet } from 'react-router-dom';
import { Home, UserCheck, Users, Calendar, BarChart2, Shield, Settings } from 'lucide-react';
import DashboardLayout from '@/components/medisync/DashboardLayout';
import { useCurrentUser } from '@/lib/useCurrentUser';

const NAV_ITEMS = [
    { path: '/admin', label: 'Overview', icon: Home },
    { path: '/admin/doctors', label: 'Doctors', icon: UserCheck },
    { path: '/admin/patients', label: 'Patients', icon: Users },
    { path: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    { path: '/admin/audit', label: 'Audit Logs', icon: Shield },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
    const user = useCurrentUser('admin');
    if (!user) return null;

    return (
        <DashboardLayout navItems={NAV_ITEMS} accentColor="#00D9B8" role="admin" title="MediSync Admin" subtitle="Platform Management">
            <Outlet />
        </DashboardLayout>
    );
}
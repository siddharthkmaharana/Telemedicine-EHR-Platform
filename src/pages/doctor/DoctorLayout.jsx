import React from 'react';
import { Outlet } from 'react-router-dom';
import { Home, Calendar, Users, ClipboardList, FileText, Video, User } from 'lucide-react';
import DashboardLayout from '@/components/medisync/DashboardLayout';
import { useCurrentUser } from '@/lib/useCurrentUser';

const NAV_ITEMS = [
    { path: '/doctor', label: 'Home', icon: Home },
    { path: '/doctor/schedule', label: 'My Schedule', icon: Calendar },
    { path: '/doctor/patients', label: 'My Patients', icon: Users },
    { path: '/doctor/consultations', label: 'Consultations', icon: ClipboardList },
    { path: '/doctor/prescribe', label: 'Write Prescription', icon: FileText },
    { path: '/doctor/video', label: 'Video Rooms', icon: Video },
    { path: '/doctor/profile', label: 'My Profile', icon: User },
];

export default function DoctorLayout() {
    const user = useCurrentUser('doctor');
    if (!user) return null;

    return (
        <DashboardLayout navItems={NAV_ITEMS} accentColor="#7C3AED" role="doctor" title={user.name} subtitle="Doctor Portal">
            <Outlet />
        </DashboardLayout>
    );
}
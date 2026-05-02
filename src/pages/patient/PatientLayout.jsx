import React from 'react';
import { Outlet } from 'react-router-dom';
import { Home, Calendar, FileText, Pill, Video, User } from 'lucide-react';
import DashboardLayout from '@/components/medisync/DashboardLayout';
import { useCurrentUser } from '@/lib/useCurrentUser';

const NAV_ITEMS = [
    { path: '/patient', label: 'Home', icon: Home },
    { path: '/patient/book', label: 'Book Appointment', icon: Calendar },
    { path: '/patient/records', label: 'Health Records', icon: FileText },
    { path: '/patient/prescriptions', label: 'Prescriptions', icon: Pill },
    { path: '/patient/video', label: 'Video Consultation', icon: Video },
    { path: '/patient/profile', label: 'My Profile', icon: User },
];

export default function PatientLayout() {
    const user = useCurrentUser('patient');
    if (!user) return null;

    const hours = new Date().getHours();
    const greeting = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <DashboardLayout
            navItems={NAV_ITEMS}
            accentColor="#F59E0B"
            role="patient"
            title={`${greeting}, ${user.name?.split(' ')[0]} 👋`}
            subtitle="Patient Portal"
        >
            <Outlet />
        </DashboardLayout>
    );
}
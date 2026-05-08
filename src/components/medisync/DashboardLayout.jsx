import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout({ navItems, accentColor, role, title, subtitle, children }) {
    return (
        <div className="flex min-h-screen" style={{ background: '#070B14' }}>
            <Sidebar navItems={navItems} accentColor={accentColor} role={role} />
            <div className="flex-1 flex flex-col min-w-0" style={{ marginLeft: 240 }}>
                <TopBar title={title} subtitle={subtitle} />
                <motion.main
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="flex-1 p-8 overflow-x-hidden"
                    style={{ maxWidth: '100%' }}
                >
                    {children}
                </motion.main>
            </div>
        </div>
    );
}

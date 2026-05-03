import React, { createContext, useContext, useState, useEffect } from 'react';

const MediSyncContext = createContext(null);

const DEMO_USERS = {
    'patient@medisync.com': { role: 'patient', name: 'Ajay Sharma', password: 'Demo@123' },
    'doctor@medisync.com': { role: 'doctor', name: 'Dr. Samay Shukla', password: 'Demo@123' },
    'admin@medisync.com': { role: 'admin', name: 'System Admin', password: 'Demo@123' },
};

export function MediSyncProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('medisync_user');
        if (stored) {
            try { setCurrentUser(JSON.parse(stored)); } catch { }
        }
    }, []);

    const login = (email, password) => {
        const user = DEMO_USERS[email];
        if (!user || user.password !== password) {
            throw new Error('Invalid credentials');
        }
        const userData = { email, role: user.role, name: user.name, loginTime: new Date().toISOString() };
        setCurrentUser(userData);
        localStorage.setItem('medisync_user', JSON.stringify(userData));
        return userData;
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('medisync_user');
        window.location.href = '/';
    };

    return (
        <MediSyncContext.Provider value={{ currentUser, login, logout }}>
            {children}
        </MediSyncContext.Provider>
    );
}

export const useMediSync = () => {
    const ctx = useContext(MediSyncContext);
    if (!ctx) throw new Error('useMediSync must be used within MediSyncProvider');
    return ctx;
};
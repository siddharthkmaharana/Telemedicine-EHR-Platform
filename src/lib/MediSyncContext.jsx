import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from './api';
const MediSyncContext = createContext(null);

export function MediSyncProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('medisync_user');
        if (stored) {
            try { setCurrentUser(JSON.parse(stored)); } catch { }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            const { token, role, userId } = response.data;
            
            const userData = { email, role, userId, loginTime: new Date().toISOString() };
            
            // For now, if name is not returned, we can use a placeholder or handle it later
            userData.name = role.charAt(0).toUpperCase() + role.slice(1); 

            setCurrentUser(userData);
            localStorage.setItem('medisync_token', token);
            localStorage.setItem('medisync_user', JSON.stringify(userData));
            return userData;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Invalid credentials');
        }
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('medisync_token');
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

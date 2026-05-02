import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useCurrentUser(requiredRole) {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem('medisync_user');
        if (!stored) { navigate('/'); return; }
        try {
            const userData = JSON.parse(stored);
            if (requiredRole && userData.role !== requiredRole) {
                navigate(`/${userData.role}`);
                return;
            }
            setUser(userData);
        } catch {
            navigate('/');
        }
    }, []);

    return user;
}
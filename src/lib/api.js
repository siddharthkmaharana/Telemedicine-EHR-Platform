import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('medisync_user') || '{}');
        const token = user.token || localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;

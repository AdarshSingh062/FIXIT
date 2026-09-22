import axios from 'axios';

let rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');

// Auto-clean accidental /health suffix if added by mistake
if (rawApiUrl.endsWith('/health')) {
  rawApiUrl = rawApiUrl.replace(/\/health$/, '');
}

// If deployed on Vercel and env var is missing, point to live Render backend
if (!rawApiUrl && typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
  rawApiUrl = 'https://fixit-4fw6.onrender.com/api';
}

const baseURL = rawApiUrl || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fixit_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired/invalid
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('fixit_token');
        localStorage.removeItem('fixit_user');
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

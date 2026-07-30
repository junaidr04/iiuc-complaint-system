// Central place that knows how to talk to the backend.
// Use this instead of raw fetch() for every call to /api/*, so the JWT
// (saved by AuthContext at login) always gets attached automatically.

// In dev, this is empty and Vite's proxy forwards /api/* to localhost:5000.
// In production (frontend and backend on different domains), set
// VITE_API_URL to the deployed backend's full URL, e.g.
// VITE_API_URL=https://ccms-backend.onrender.com
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('ccms_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            ...(options.headers || {}),
        },
    });

    // Session expired or token invalid/missing — clear it and bounce to login
    if (res.status === 401) {
        localStorage.removeItem('ccms_user');
        localStorage.removeItem('ccms_token');
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    }

    return res;
}
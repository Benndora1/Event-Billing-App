import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Set initial auth token if exists
const token = localStorage.getItem('access_token');
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Helper function to set auth token
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('access_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        delete api.defaults.headers.common['Authorization'];
    }
};

// Helper function to get current auth token
export const getAuthToken = () => {
    return localStorage.getItem('access_token');
};

// Helper function to set refresh token
export const setRefreshToken = (token) => {
    if (token) {
        localStorage.setItem('refresh_token', token);
    } else {
        localStorage.removeItem('refresh_token');
    }
};

// Helper function to get refresh token
export const getRefreshToken = () => {
    return localStorage.getItem('refresh_token');
};

// Token refresh function
export const refreshToken = async () => {
    try {
        const refresh = getRefreshToken();
        if (!refresh) {
            throw new Error('No refresh token available');
        }
        
        const response = await authAPI.refreshToken(refresh);
        const newAccessToken = response.data.access;
        const newRefreshToken = response.data.refresh;
        
        setAuthToken(newAccessToken);
        if (newRefreshToken) {
            setRefreshToken(newRefreshToken);
        }
        
        return true;
    } catch (error) {
        console.error('Token refresh failed:', error);
        // Clear tokens on refresh failure
        setAuthToken(null);
        return false;
    }
};

// Add response interceptor for automatic token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't tried refreshing yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshed = await refreshToken();
                if (refreshed) {
                    // Retry the original request with new token
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error('Refresh failed:', refreshError);
                // Will be handled by the router guard
            }
        }
        
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/token/', credentials),
    register: (userData) => api.post('/auth/register/', userData),
    refreshToken: (refresh) => api.post('/auth/token/refresh/', { refresh }),
};

//Client API
export const clientAPI = {
    getAll: () => api.get('/clients/'),
    get: (id) => api.get(`/clients/${id}/`),
    create: (data) => api.post('/clients/', data),
    update: (id, data) => api.put(`/clients/${id}/`, data),
    delete: (id) => api.delete(`/clients/${id}/`),
};

// Quotation API
export const quotationAPI = {
    getAll: () => api.get('/quotations/'),
    get: (id) => api.get(`/quotations/${id}/`),
    create: (data) => api.post('/quotations/', data),
    update: (id, data) => api.put(`/quotations/${id}/`, data),
    delete: (id) => api.delete(`/quotations/${id}/`),
    sendEmail: (id) => api.post(`/quotations/${id}/send_email/`),
};

// Receipt API
export const receiptAPI = {
    getAll: () => api.get('/receipts/'),
    get: (id) => api.get(`/receipts/${id}/`),
    create: (data) => api.post('/receipts/', data),
    update: (id, data) => api.put(`/receipts/${id}/`, data),
    delete: (id) => api.delete(`/receipts/${id}/`),
    sendEmail: (id) => api.post(`/receipts/${id}/send_email/`),
};

export default api;

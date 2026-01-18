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
        delete api.defaults.headers.common['Authorization'];
    }
};

// Helper function to get current auth token
export const getAuthToken = () => {
    return localStorage.getItem('access_token');
};

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

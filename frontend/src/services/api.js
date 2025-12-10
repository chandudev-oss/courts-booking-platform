import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhance error object with network error information
    if (error.code === 'ERR_NETWORK' || error.message?.includes('ERR_EMPTY_RESPONSE')) {
      error.message = 'Network error: Unable to connect to the server. Please ensure the backend is running.';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Courts API
export const courtsAPI = {
  getAll: () => api.get('/courts'),
  getAllAdmin: () => api.get('/admin/courts'), // Admin gets all including inactive
  getById: (id) => api.get(`/courts/${id}`),
  create: (data) => api.post('/admin/courts', data),
  update: (id, data) => api.patch(`/admin/courts/${id}`, data),
  delete: (id) => api.delete(`/admin/courts/${id}`),
};

// Coaches API
export const coachesAPI = {
  getAll: () => api.get('/coaches'),
  getById: (id) => api.get(`/coaches/${id}`),
  create: (data) => api.post('/admin/coaches', data),
  update: (id, data) => api.patch(`/admin/coaches/${id}`, data),
};

// Equipment API
export const equipmentAPI = {
  getAll: () => api.get('/equipment'),
  getById: (id) => api.get(`/equipment/${id}`),
  create: (data) => api.post('/admin/equipment', data),
  update: (id, data) => api.patch(`/admin/equipment/${id}`, data),
};

// Pricing Rules API
export const pricingRulesAPI = {
  getAll: () => api.get('/pricing-rules'),
  getById: (id) => api.get(`/pricing-rules/${id}`),
  create: (data) => api.post('/admin/pricing-rules', data),
  update: (id, data) => api.patch(`/admin/pricing-rules/${id}`, data),
  delete: (id) => api.delete(`/admin/pricing-rules/${id}`),
};

// Bookings API
export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getUserBookings: () => api.get('/bookings/user'),
  getAllBookings: () => api.get('/bookings/admin'),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
};

// Pricing API
export const pricingAPI = {
  estimate: (data) => api.post('/pricing/estimate', data),
};

// Stats API
export const statsAPI = {
  getDashboardStats: () => api.get('/admin/stats/dashboard'),
};

export default api;


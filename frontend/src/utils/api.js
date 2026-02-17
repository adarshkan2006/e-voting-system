import axios from 'axios';

// Use relative URL so Vite proxy forwards to backend (works on LAN too)
const API_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });

          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  refresh: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, new_password: newPassword }),
};

// Elections API
export const electionsAPI = {
  getAll: () => api.get('/elections'),
  getOne: (id) => api.get(`/elections/${id}`),
  create: (data) => api.post('/elections', data),
  update: (id, data) => api.put(`/elections/${id}`, data),
  toggle: (id) => api.post(`/elections/${id}/toggle`),
  getCandidates: (id) => api.get(`/elections/${id}/candidates`),
  addCandidate: (id, data) => api.post(`/elections/${id}/candidates`, data),
  vote: (id, candidateId) => api.post(`/elections/${id}/vote`, { candidate_id: candidateId }),
  hasVoted: (id) => api.get(`/elections/${id}/has-voted`),
  getResults: (id) => api.get(`/elections/${id}/results`),
};

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  verifyVoter: (userId) => api.post(`/admin/verify-voter/${userId}`),
  makeAdmin: (userId) => api.post(`/admin/make-admin/${userId}`),
  deleteUser: (userId) => api.delete(`/admin/delete-user/${userId}`),
};

// Blockchain API
export const blockchainAPI = {
  getStatus: () => api.get('/blockchain/status'),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;

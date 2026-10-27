import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for responses / unauthorized handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If 401 and current path is not login/register, clear auth token
      const isAuthRoute = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');
      if (!isAuthRoute && localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Movies APIs
export const moviesAPI = {
  getAll: (params) => api.get('/movies', { params }),
  getById: (id) => api.get(`/movies/${id}`),
  create: (data) => api.post('/movies', data),
  update: (id, data) => api.put(`/movies/${id}`, data),
  delete: (id) => api.delete(`/movies/${id}`),
};

// Theaters APIs
export const theatersAPI = {
  getAll: () => api.get('/theaters'),
  getById: (id) => api.get(`/theaters/${id}`),
  create: (data) => api.post('/theaters', data),
  update: (id, data) => api.put(`/theaters/${id}`, data),
  delete: (id) => api.delete(`/theaters/${id}`),
};

// Shows APIs
export const showsAPI = {
  getAll: (params) => api.get('/shows', { params }),
  getById: (id) => api.get(`/shows/${id}`),
  create: (data) => api.post('/shows', data),
  update: (id, data) => api.put(`/shows/${id}`, data),
  delete: (id) => api.delete(`/shows/${id}`),
  lockSeats: (showId, seats) => api.post(`/shows/${showId}/lock`, { seats }),
};

// Bookings APIs
export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.post(`/bookings/${id}/cancel`),
};

// Payments APIs
export const paymentsAPI = {
  getConfig: () => api.get('/payments/config'),
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
};

// Favorites APIs
export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  add: (movieId) => api.post(`/favorites/${movieId}`),
  remove: (movieId) => api.delete(`/favorites/${movieId}`),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getBookings: (params) => api.get('/admin/bookings', { params }),
  getUsers: () => api.get('/admin/users'),
};

export default api;

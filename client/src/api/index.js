import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to admin requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.url?.includes('/admin/')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
    return Promise.reject(error);
  }
);

// === Products ===
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const getCategories = () => api.get('/products/categories');
export const createProduct = (formData) =>
  api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// === Reviews ===
export const getProductReviews = (productId) => api.get(`/reviews/${productId}`);
export const submitReview = (data) => api.post('/reviews', data);
export const getAllReviews = () => api.get('/reviews');
export const getPendingReviews = () => api.get('/reviews/pending/list');
export const toggleReviewApproval = (id) => api.put(`/reviews/${id}/approve`);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

// === Orders ===
export const createOrder = (data) => api.post('/orders', data);
export const getOrders = (params) => api.get('/orders', { params });
export const getOrder = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
export const getAnalytics = () => api.get('/orders/analytics');

// === Customers ===
export const createCustomer = (data) => api.post('/customers', data);
export const getCustomerByPhone = (phone) => api.get(`/customers/phone/${phone}`);
export const getWishlist = (id) => api.get(`/customers/${id}/wishlist`);
export const updateWishlist = (id, productId, action) =>
  api.put(`/customers/${id}/wishlist`, { productId, action });

// === Customer Auth ===
export const registerCustomer = (data) => api.post('/customers/register', data);
export const loginCustomer = (data) => api.post('/customers/login', data);
export const logoutCustomer = () => api.post('/customers/logout');
export const getCustomerProfile = () => api.get('/customers/me');
export const updateCustomerProfile = (data) => api.put('/customers/me', data);
export const forgotPassword = (data) => api.post('/customers/forgot-password', data);
export const resetPassword = (data) => api.put('/customers/reset-password', data);
export const getMyOrders = () => api.get('/orders/my');

// === Admin ===
export const adminLogin = (credentials) => api.post('/admin/login', credentials);
export const getAdminProfile = () => api.get('/admin/me');
export const changePassword = (data) => api.put('/admin/password', data);

// === Settings ===
export const getSettings = () => api.get('/settings');
export const updateSettings = (data) => api.put('/settings', data);

export default api;

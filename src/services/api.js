import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`, // Changed to VITE_API_URL
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Address Book API
export const getAddresses = () => api.get('/addresses');
export const addAddress = (address) => api.post('/addresses', address);
export const updateAddress = (id, address) => api.put(`/addresses/${id}`, address);
export const deleteAddress = (id) => api.delete(`/addresses/${id}`);

// Order Address Management
export const updateOrderAddress = (orderId, newAddress) => api.put(`/orders/${orderId}/address`, newAddress, { headers: { 'Content-Type': 'application/json' } });
export const deleteOrder = (orderId) => api.delete(`/orders/${orderId}`);

// Payment API
export const createPaymentIntent = (amount, currency = 'usd') => api.post('/payment/create-payment-intent', { amount, currency });
export const confirmPayment = (paymentIntentId, status) => api.post('/payment/confirm-payment', { paymentIntentId, status });
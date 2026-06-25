import api from './axios';

export const getBills = () => api.get('/bills').then((r) => r.data);
export const getBillHistory = (params) =>
  api.get('/bills/history', { params }).then((r) => r.data);

export const createBill = (formData) =>
  api.post('/bills', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

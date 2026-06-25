import api from './axios';

export const getStock = () => api.get('/stock').then((r) => r.data);
export const getStockHistory = (params) =>
  api.get('/stock/history', { params }).then((r) => r.data);
export const createStock = (data) => api.post('/stock', data).then((r) => r.data);

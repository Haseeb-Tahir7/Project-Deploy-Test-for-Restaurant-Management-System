import api from './axios';

export const getReceipts = () => api.get('/receipts').then((r) => r.data);
export const getReceiptStats = () => api.get('/receipts/stats').then((r) => r.data);
export const searchReceipts = (receiptNumber) =>
  api.get('/receipts/search', { params: { receiptNumber } }).then((r) => r.data);
export const getDailyReceipts = (date) =>
  api.get('/receipts/daily', { params: { date } }).then((r) => r.data);
export const createReceipt = (data) => api.post('/receipts', data).then((r) => r.data);

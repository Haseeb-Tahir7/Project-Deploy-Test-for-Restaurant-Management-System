import api from './axios';

export const getAnalytics = (month) =>
  api.get('/analytics', { params: month ? { month } : {} }).then((r) => r.data);

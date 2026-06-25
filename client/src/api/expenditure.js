import api from './axios';

export const getTodayExpenditure = () => api.get('/expenditure/today').then((r) => r.data);
export const setTodayExpenditure = (amount) =>
  api.put('/expenditure/today', { amount }).then((r) => r.data);

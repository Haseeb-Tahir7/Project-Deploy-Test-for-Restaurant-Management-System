import api from './axios';

export const getCoupons = () => api.get('/coupons').then((r) => r.data);
export const createCoupon = (discountPercent, code) =>
  api.post('/coupons', { discountPercent, code }).then((r) => r.data);
export const deactivateCoupon = (id) => api.delete(`/coupons/${id}`).then((r) => r.data);
export const verifyCoupon = (code) =>
  api.post('/coupons/verify', { code }).then((r) => r.data);

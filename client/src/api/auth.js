import api from './axios';

export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then((r) => r.data);

export const seedAdmin = (data) =>
  api.post('/auth/seed', data).then((r) => r.data);

export const registerUser = (data) =>
  api.post('/auth/register', data).then((r) => r.data);

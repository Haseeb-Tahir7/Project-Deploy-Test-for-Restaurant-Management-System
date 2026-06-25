import api from './axios';

export const getNotes = () => api.get('/notes').then((r) => r.data);
export const createNote = (content) => api.post('/notes', { content }).then((r) => r.data);
export const updateNote = (id, content) => api.put(`/notes/${id}`, { content }).then((r) => r.data);
export const deleteNote = (id) => api.delete(`/notes/${id}`).then((r) => r.data);

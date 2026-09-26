import api from './api';

const api = api.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

export default api;

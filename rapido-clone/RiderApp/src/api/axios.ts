import axios from 'axios';
import { getAccessToken } from '@/storage/authStorage';

const API_URL = 'http://10.5.49.123:4000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use(
  async (config) => {
    const accessToken = await getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
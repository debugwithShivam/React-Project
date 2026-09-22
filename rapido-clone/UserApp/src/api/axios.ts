import axios from 'axios';
import { getAccessToken } from '@/storage/authStorage';

// Use the computer's LAN address when testing on a physical device.
// Android emulators can use http://10.0.2.2:<backend-port>/api instead.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.153.121.121:4000/api';

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

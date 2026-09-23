import axios from 'axios';
import { getAccessToken } from '@/storage/authStorage';

// On a physical phone, `localhost` means the phone itself, not this computer.
// Set EXPO_PUBLIC_API_URL in .env to the computer's LAN address (or 10.0.2.2
// when using the Android emulator).
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api';

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
  (error) => Promise.reject(error)
);

export default api;

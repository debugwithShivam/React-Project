import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from '@/storage/authStorage';

// On a physical phone, `localhost` means the phone itself, not this computer.
// Set EXPO_PUBLIC_API_URL in .env to the computer's LAN address (or 10.0.2.2
// when using the Android emulator).
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.161:4000/api';

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

// Shared promise so concurrent 401s trigger a single refresh call.
let refreshPromise: Promise<string | null> | null = null;

const doRefresh = async (): Promise<string | null> => {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  // Use a bare axios call (not `api`) to avoid re-entering the interceptors.
  const res = await axios.post(
    `${API_URL}/auth/refreshToken`,
    { refreshToken },
    { timeout: 15000 }
  );

  const data = res.data;
  const newAccess = data?.accessToken;
  const newRefresh = data?.refreshToken;

  if (!newAccess || !newRefresh) {
    return null;
  }

  await saveTokens(newAccess, newRefresh);
  return newAccess;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    const isAuthCall =
      originalRequest?.url?.includes('/auth/refreshToken') ||
      originalRequest?.url?.includes('/auth/login');

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthCall) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = doRefresh().finally(() => {
            refreshPromise = null;
          });
        }

        const newAccess = await refreshPromise;

        if (newAccess) {
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // fall through to sign-out below
      }

      await clearTokens();
    }

    return Promise.reject(error);
  }
);

export default api;

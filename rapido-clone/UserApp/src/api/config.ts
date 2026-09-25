import Constants from 'expo-constants';

/**
 * Resolve the API base URL from environment configuration.
 *
 * Priority:
 *   1. EXPO_PUBLIC_API_URL  — set at build time via env or `eas build --env`
 *   2. extra.apiUrl         — set in app.json for runtime fallback
 *   3. http://localhost:4000/api — dev-only default (simulator/emulator)
 *
 * No hardcoded LAN IP is used as a fallback — that is a production
 * risk if the image is shipped without overriding it.
 */
export const resolveApiUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  const configUrl = Constants?.expoConfig?.extra?.apiUrl as string | undefined;
  if (configUrl) {
    return configUrl.replace(/\/+$/, '');
  }

  if (__DEV__) {
    return 'http://localhost:4000/api';
  }

  throw new Error(
    'API URL is not configured. Set EXPO_PUBLIC_API_URL or extra.apiUrl in app.json.'
  );
};

export const API_URL = resolveApiUrl();

/**
 * Derive the Socket.IO server URL from the API URL.
 * Strips a trailing "/api" segment and upgrades the protocol
 * to WebSocket (http → ws, https → wss).
 */
export const SOCKET_URL = API_URL.replace(/\/api\/?$/, '').replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');

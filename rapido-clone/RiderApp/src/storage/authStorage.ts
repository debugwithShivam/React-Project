import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'sawaari_captain_access_token';
const REFRESH_TOKEN_KEY = 'sawaari_captain_refresh_token';
const SIGNED_OUT_KEY = 'sawaari_captain_signed_out';

export const saveTokens = async (accessToken: string, refreshToken: string) => {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    SecureStore.deleteItemAsync(SIGNED_OUT_KEY),
  ]);
};

export const getAccessToken = async () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
export const getRefreshToken = async () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

export const clearTokens = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.setItemAsync(SIGNED_OUT_KEY, 'true'),
  ]);
};

export const wasExplicitlySignedOut = async () =>
  (await SecureStore.getItemAsync(SIGNED_OUT_KEY)) === 'true';

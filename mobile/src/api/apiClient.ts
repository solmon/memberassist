import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';

declare const process: { env: Record<string, string | undefined> };
const BASE_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !isRefreshing) {
      isRefreshing = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        await useAuthStore.getState().clearAuth();
        isRefreshing = false;
        return Promise.reject(error);
      }
      try {
        const resp = await axios.post<{ accessToken: string; refreshToken: string }>(
          `${BASE_URL}/auth/refresh`,
          { refreshToken },
        );
        const { accessToken: newAccess, refreshToken: newRefresh } = resp.data;
        const user = useAuthStore.getState().user;
        if (user) {
          await useAuthStore.getState().setAuth({ accessToken: newAccess, refreshToken: newRefresh }, user);
        }
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
        }
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch {
        await useAuthStore.getState().clearAuth();
        isRefreshing = false;
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

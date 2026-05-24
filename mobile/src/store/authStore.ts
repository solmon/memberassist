import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// expo-secure-store is not available on web; fall back to localStorage
const storage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  tenantId: string;
  role: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setAuth: (tokens: { accessToken: string; refreshToken: string }, user: AuthUser) => Promise<void>;
  clearAuth: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,

  setAuth: async ({ accessToken, refreshToken }, user) => {
    await storage.setItem('accessToken', accessToken);
    await storage.setItem('refreshToken', refreshToken);
    await storage.setItem('user', JSON.stringify(user));
    set({ accessToken, refreshToken, user });
  },

  clearAuth: async () => {
    await storage.removeItem('accessToken');
    await storage.removeItem('refreshToken');
    await storage.removeItem('user');
    set({ accessToken: null, refreshToken: null, user: null });
  },

  hydrate: async () => {
    const accessToken = await storage.getItem('accessToken');
    const refreshToken = await storage.getItem('refreshToken');
    const userStr = await storage.getItem('user');
    const user: AuthUser | null = userStr ? (JSON.parse(userStr) as AuthUser) : null;
    set({ accessToken, refreshToken, user });
  },
}));

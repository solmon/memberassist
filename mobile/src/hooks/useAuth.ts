import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/authApi';

export function useAuth() {
  const { user, accessToken, setAuth, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!accessToken;

  async function login(email: string, password: string, tenantSlug: string) {
    setIsLoading(true);
    setError(null);
    try {
      const tokens = await authApi.login({ email, password, tenantSlug });
      // Temporarily store the access token so the request interceptor can attach it
      useAuthStore.setState({ accessToken: tokens.accessToken });
      const me = await authApi.getMe();
      setAuth(
        {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        {
          id: me.id,
          email: me.email,
          tenantId: me.tenantId,
          role: me.role,
        },
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Login failed';
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // ignore logout errors
    } finally {
      clearAuth();
    }
  }

  return { user, isAuthenticated, login, logout, isLoading, error };
}

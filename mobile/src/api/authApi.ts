import { apiClient } from './apiClient';
import { TokenResponseDto } from '../types/auth.types';

export interface LoginRequest {
  email: string;
  password: string;
  tenantSlug: string;
}

export const authApi = {
  login: (data: LoginRequest): Promise<TokenResponseDto> =>
    apiClient.post<TokenResponseDto>('/auth/login', data).then((r) => r.data),

  refresh: (refreshToken: string): Promise<TokenResponseDto> =>
    apiClient.post<TokenResponseDto>('/auth/refresh', { refreshToken }).then((r) => r.data),

  logout: (): Promise<void> =>
    apiClient.post('/auth/logout').then(() => undefined),

  getMe: () =>
    apiClient.get('/auth/me').then((r) => r.data),
};

export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserInfo {
  id: string;
  email: string;
  tenantId: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

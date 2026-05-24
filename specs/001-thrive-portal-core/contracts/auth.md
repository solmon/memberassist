# Contract: Authentication & Session

**Module**: `AuthModule` | Controller path: `/auth`

All endpoints are public unless marked 🔒 (requires `JwtAuthGuard`).

---

## POST /auth/login

Authenticate a member with email + password. Returns an access token (short-lived JWT) and
a refresh token (long-lived, stored as an httpOnly cookie or returned in body for mobile).

### Request Body DTO

```typescript
// login.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  tenantSlug: string;          // identifies the tenant context
}
```

### Response `200 OK`

```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
  "expiresIn": 900,
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g...",
  "member": {
    "id": "uuid",
    "firstName": "Jane",
    "role": "MEMBER",
    "tenantId": "uuid"
  }
}
```

### Error Responses

| Status | Code | Trigger |
|---|---|---|
| `401` | `INVALID_CREDENTIALS` | Wrong email or password |
| `403` | `ACCOUNT_DISABLED` | `member.isActive = false` |
| `404` | `TENANT_NOT_FOUND` | `tenantSlug` does not resolve |

---

## POST /auth/refresh

Exchange a valid refresh token for a new access token (token rotation — old token is revoked).

### Request Body DTO

```typescript
export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}
```

### Response `200 OK`

```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
  "expiresIn": 900,
  "refreshToken": "bmV3UmVmcmVzaFRva2Vu..."
}
```

### Error Responses

| Status | Code | Trigger |
|---|---|---|
| `401` | `TOKEN_EXPIRED` | Refresh token past `expiresAt` |
| `401` | `TOKEN_REVOKED` | `revokedAt` is set |

---

## POST /auth/logout 🔒

Revoke the current refresh token. Access token expiry is handled client-side.

### Headers

```
Authorization: Bearer <accessToken>
X-Tenant-ID: <tenantId>
```

### Request Body DTO

```typescript
export class LogoutDto {
  @IsString()
  refreshToken: string;
}
```

### Response `204 No Content`

---

## GET /auth/me 🔒

Return the authenticated member's profile summary.

### Headers

```
Authorization: Bearer <accessToken>
X-Tenant-ID: <tenantId>
```

### Response `200 OK`

```json
{
  "id": "uuid",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "role": "MEMBER",
  "tenantId": "uuid",
  "districtId": "uuid | null"
}
```

---

## JWT Payload Structure

```typescript
interface JwtPayload {
  sub: string;        // Member.id
  tenantId: string;   // Tenant.id
  role: MemberRole;   // MEMBER | ADMIN | BROKER_PORTAL
  iat: number;
  exp: number;
}
```

Access token TTL: **15 minutes**. Refresh token TTL: **30 days**.

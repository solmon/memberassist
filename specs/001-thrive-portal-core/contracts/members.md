# Contract: Members & Profile

**Module**: `MembersModule` | Controller path: `/members`

All endpoints require 🔒 `JwtAuthGuard`. `tenantId` is extracted from the JWT via the
`@TenantId()` decorator — it is NEVER accepted from the request body or query string.

---

## GET /members/profile 🔒

Return the authenticated member's full profile including their active plan enrollment summary.

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
  "memberIdNumber": "THRV-0001234",
  "email": "jane@example.com",
  "phone": "+1-555-000-1234",
  "dateOfBirth": "1985-03-15",
  "role": "MEMBER",
  "tenantId": "uuid",
  "districtId": "uuid | null",
  "activeEnrollment": {
    "id": "uuid",
    "planName": "Thrive Gold PPO",
    "planTier": "GOLD",
    "groupNumber": "GRP-9901",
    "status": "ACTIVE",
    "effectiveDate": "2025-01-01",
    "nextRenewalDate": "2026-01-01",
    "premiumAmount": "450.00",
    "premiumCycle": "MONTHLY"
  }
}
```

### Notes

- `activeEnrollment` is the single enrollment where `status = ACTIVE`. If none, field is `null`.
- PHI fields (`dateOfBirth`, `email`, `phone`) are NEVER written to server logs.

---

## PATCH /members/profile 🔒

Update mutable profile fields. Email and `memberIdNumber` are immutable.

### Request Body DTO

```typescript
// update-member.dto.ts
import { IsOptional, IsString, IsPhoneNumber, MinLength } from 'class-validator';

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  @MinLength(8)
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}
```

### Response `200 OK`

Returns the updated profile (same shape as GET /members/profile, without `activeEnrollment`).

### Error Responses

| Status | Code | Trigger |
|---|---|---|
| `400` | `VALIDATION_ERROR` | DTO validation failure |
| `403` | `TENANT_MISMATCH` | JWT `tenantId` does not match resource |

---

## GET /members/tenant-config 🔒

Return the tenant's branding and configuration applicable to the authenticated member's session.
Used to hydrate `tenantStore` on the mobile app.

### Response `200 OK`

```json
{
  "tenantId": "uuid",
  "name": "Acme Health District",
  "slug": "acme-health",
  "logoUrl": "https://cdn.example.com/logos/acme.png",
  "primaryColour": "#1A73E8"
}
```

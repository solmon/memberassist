# Contract: Plans & Enrollments

**Module**: `PlansModule` | Controller path: `/plans`

All endpoints require 🔒 `JwtAuthGuard`.

---

## GET /plans/enrollment 🔒

Return the authenticated member's active plan enrollment detail. Maps to FHIR Coverage resource.

### Headers

```
Authorization: Bearer <accessToken>
X-Tenant-ID: <tenantId>
```

### Response `200 OK`

```json
{
  "id": "uuid",
  "memberId": "uuid",
  "planName": "Thrive Gold PPO",
  "planTier": "GOLD",
  "groupNumber": "GRP-9901",
  "status": "ACTIVE",
  "effectiveDate": "2025-01-01T00:00:00Z",
  "terminationDate": null,
  "nextRenewalDate": "2026-01-01T00:00:00Z",
  "premiumAmount": "450.00",
  "premiumCycle": "MONTHLY"
}
```

### Error Responses

| Status | Code | Trigger |
|---|---|---|
| `404` | `NO_ACTIVE_ENROLLMENT` | Member has no `ACTIVE` enrollment |

---

## GET /plans/enrollment/history 🔒

Return all enrollment records for the authenticated member, ordered by `effectiveDate` descending.

### Query Parameters

```typescript
export class EnrollmentHistoryQueryDto {
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;    // filter by status

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;               // default 10

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;              // default 0
}
```

### Response `200 OK`

```json
{
  "total": 3,
  "items": [
    {
      "id": "uuid",
      "planName": "Thrive Gold PPO",
      "planTier": "GOLD",
      "status": "ACTIVE",
      "effectiveDate": "2025-01-01T00:00:00Z",
      "terminationDate": null
    }
  ]
}
```

---

## GET /plans/enrollment/card 🔒

Return the digital insurance card data for the authenticated member's active enrollment.

### Response `200 OK`

```json
{
  "id": "uuid",
  "cardholderName": "JANE DOE",
  "memberIdNumber": "THRV-0001234",
  "groupNumber": "GRP-9901",
  "planName": "Thrive Gold PPO",
  "planTier": "GOLD",
  "effectiveDate": "2025-01-01",
  "terminationDate": null
}
```

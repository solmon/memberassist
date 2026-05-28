# API Contract: GET /members/me/plan-summary

**Feature**: 002-improve-home-dependants-views  
**Controller**: `MembersController` (`api/src/modules/members/members.controller.ts`)

---

## Endpoint

```
GET /members/me/plan-summary
```

---

## Authentication

| Mechanism | Details |
|---|---|
| Guard | `JwtAuthGuard` → extracts `memberId` + `tenantId` from JWT payload |
| Tenant Guard | `TenantGuard` → validates `tenantId` against request context |

Both guards are already applied to `MembersController`. No additional authentication logic required.

---

## Request

No request body. No query parameters.

**Headers**:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## Response

### 200 OK

Returns an **array** of plan summary objects — one per active or pending enrollment for the authenticated member. Empty array if the member has no current enrollments.

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "planName": "Horizon Blue Cross Blue Shield",
    "planType": "MEDICAL",
    "planTier": "GOLD",
    "groupNumber": "GRP-001234",
    "effectiveDate": "2026-01-01T00:00:00.000Z",
    "terminationDate": null,
    "nextRenewalDate": "2027-01-01T00:00:00.000Z",
    "status": "ACTIVE",
    "monthlyPremium": 320.00,
    "deductibleLimit": 1500.00,
    "deductibleMet": 425.00,
    "memberIdNumber": "MBR-10001",
    "firstName": "Jane",
    "lastName": "Doe"
  },
  {
    "id": "9c1b8f41-3e52-4a70-9d2f-1c874f66bba1",
    "planName": "Delta Dental Premier",
    "planType": "DENTAL",
    "planTier": "SILVER",
    "groupNumber": "GRP-001234",
    "effectiveDate": "2026-01-01T00:00:00.000Z",
    "terminationDate": null,
    "nextRenewalDate": "2027-01-01T00:00:00.000Z",
    "status": "ACTIVE",
    "monthlyPremium": 45.00,
    "deductibleLimit": null,
    "deductibleMet": null,
    "memberIdNumber": "MBR-10001",
    "firstName": "Jane",
    "lastName": "Doe"
  }
]
```

### Response Field Definitions

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `id` | `string (UUID)` | No | Enrollment record ID |
| `planName` | `string` | No | Plan name |
| `planType` | `string` | No | One of `MEDICAL \| DENTAL \| VISION \| LIFE` |
| `planTier` | `string` | No | E.g. `BRONZE`, `SILVER`, `GOLD`, `PLATINUM` |
| `groupNumber` | `string` | No | Group policy number |
| `effectiveDate` | `ISO 8601 string` | No | Coverage start date |
| `terminationDate` | `ISO 8601 string` | Yes | `null` = ongoing |
| `nextRenewalDate` | `ISO 8601 string` | Yes | `null` = no upcoming renewal |
| `status` | `string` | No | `ACTIVE`, `INACTIVE`, `TERMINATED`, `PENDING` |
| `monthlyPremium` | `number (decimal)` | No | Monthly premium in USD |
| `deductibleLimit` | `number (decimal)` | Yes | `null` = plan has no deductible |
| `deductibleMet` | `number (decimal)` | Yes | `null` when `deductibleLimit` is `null` |
| `memberIdNumber` | `string` | No | Member ID number |
| `firstName` | `string` | No | Member first name |
| `lastName` | `string` | No | Member last name |

**Excluded fields (PHI guardrail)**: `email`, `dateOfBirth`, `phone`, `passwordHash`, `districtId`, `tenantId`.

---

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

Returned when JWT is missing, expired, or invalid.

---

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Member not found"
}
```

Returned when the `memberId` from the JWT has no matching `Member` row in the database (e.g. account deleted after token issued).

---

## Query Logic (Implementation Reference)

```typescript
// Pseudocode — see members.service.ts for implementation
const enrollments = await prisma.planEnrollment.findMany({
  where: {
    tenantId,
    memberId,
    status: { in: ['ACTIVE', 'PENDING'] },
  },
  select: {
    id: true,
    planName: true,
    planType: true,
    planTier: true,
    groupNumber: true,
    effectiveDate: true,
    terminationDate: true,
    nextRenewalDate: true,
    status: true,
    premiumAmount: true,
    deductibleLimit: true,
    deductibleMet: true,
    member: {
      select: {
        firstName: true,
        lastName: true,
        memberIdNumber: true,
      },
    },
  },
  orderBy: [{ planType: 'asc' }, { effectiveDate: 'desc' }],
});
```

`premiumAmount` is aliased to `monthlyPremium` in the response DTO; the stored value is always monthly-equivalent regardless of `premiumCycle`.

---

## Notes

- **No pagination**: A member is expected to have at most 4–5 simultaneous active enrollments (one per coverage line). Full list is returned in a single response.
- **Decimal serialization**: Prisma returns `Decimal` instances for `Decimal(10,2)` columns. The response DTO must call `.toNumber()` or use `class-transformer` `@Transform` to serialize them as JSON numbers, not strings.
- **`deductibleMet` > `deductibleLimit`**: Valid edge case (over-deductible from out-of-network claims). The mobile client clamps the progress bar to 100%.

# API Contract: GET /members/me/dependants

**Feature**: 002-improve-home-dependants-views  
**Controller**: `MembersController` (`api/src/modules/members/members.controller.ts`)

---

## Endpoint

```
GET /members/me/dependants
```

---

## Authentication

| Mechanism | Details |
|---|---|
| Guard | `JwtAuthGuard` → extracts `memberId` + `tenantId` from JWT payload |
| Tenant Guard | `TenantGuard` → validates `tenantId` against request context |

Both guards are already applied to `MembersController`.

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

Returns an **array** of active dependants for the authenticated member. Empty array if the member has no active dependants.

```json
[
  {
    "id": "7a3b9c12-4e51-4f88-b2ad-9bc0c2b7edd2",
    "firstName": "Alex",
    "lastName": "Doe",
    "relationship": "CHILD",
    "dateOfBirth": "2015-06-14T00:00:00.000Z",
    "isActive": true,
    "coverageStatus": "ACTIVE",
    "digitalCard": {
      "cardholderName": "Alex Doe",
      "memberIdNumber": "MBR-10001-D1",
      "groupNumber": "GRP-001234",
      "planName": "Horizon Blue Cross Blue Shield",
      "effectiveDate": "2026-01-01T00:00:00.000Z",
      "terminationDate": null
    }
  },
  {
    "id": "2f0d8e45-9c3a-4b77-a1f6-8e2c0d1b5f33",
    "firstName": "Morgan",
    "lastName": "Doe",
    "relationship": "SPOUSE",
    "dateOfBirth": "1988-11-22T00:00:00.000Z",
    "isActive": true,
    "coverageStatus": "ACTIVE",
    "digitalCard": null
  }
]
```

### Response Field Definitions

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `id` | `string (UUID)` | No | Dependant record ID |
| `firstName` | `string` | No | Dependant first name |
| `lastName` | `string` | No | Dependant last name |
| `relationship` | `string` | No | `SPOUSE`, `CHILD`, `DOMESTIC_PARTNER`, `OTHER` |
| `dateOfBirth` | `ISO 8601 string` | No | Full DOB — client uses this to compute age. **Must not be rendered as-is in the UI**. |
| `isActive` | `boolean` | No | Always `true` in this endpoint (inactive are filtered server-side) |
| `coverageStatus` | `string` | No | Derived from the linked enrollment's `status`. `ACTIVE`, `INACTIVE`, `TERMINATED`, `PENDING`. `UNKNOWN` if no linked enrollment found. |
| `digitalCard` | `object \| null` | Yes | `null` = card not yet issued. See sub-fields below. |

#### `digitalCard` Sub-Object Fields

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `cardholderName` | `string` | No | Printed cardholder name |
| `memberIdNumber` | `string` | No | Member ID on the card |
| `groupNumber` | `string` | No | Group policy number |
| `planName` | `string` | No | Plan name as it appears on the card |
| `effectiveDate` | `ISO 8601 string` | No | Coverage start on card |
| `terminationDate` | `ISO 8601 string` | Yes | `null` = ongoing coverage |

**Excluded fields (PHI guardrail)**: `tenantId`, `memberId`, `email`, `passwordHash`, `phone`. `dateOfBirth` is included but the mobile app **must not render the raw date string** — only a computed age ("Age 9").

---

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## Query Logic (Implementation Reference)

```typescript
// Pseudocode — see members.service.ts for implementation
const dependants = await prisma.dependent.findMany({
  where: {
    tenantId,
    memberId,
    isActive: true,
  },
  select: {
    id: true,
    firstName: true,
    lastName: true,
    relationship: true,
    dateOfBirth: true,
    isActive: true,
    memberIdNumber: true,
    digitalCards: {
      where: { enrollmentId: { not: null } },
      select: {
        cardholderName: true,
        memberIdNumber: true,
        groupNumber: true,
        planName: true,
        effectiveDate: true,
        terminationDate: true,
        enrollment: {
          select: { status: true },
        },
      },
      take: 1,
      orderBy: { effectiveDate: 'desc' },
    },
  },
  orderBy: [{ relationship: 'asc' }, { firstName: 'asc' }],
});
```

`coverageStatus` is derived in the service layer from `digitalCards[0]?.enrollment?.status ?? 'UNKNOWN'`.

---

## Notes

- **`dateOfBirth` in response**: Although `dateOfBirth` is sensitive, it is included because the mobile client needs it to compute and display the dependant's age. The UI layer must compute age as `Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000))` and display only the number ("Age 9"). The raw ISO date string must not appear in any rendered text element.
- **One card per dependant**: Only the most recent `DigitalInsuranceCard` (by `effectiveDate` DESC, `LIMIT 1`) is returned per dependant to keep the response flat and mobile-friendly.
- **No pagination**: Members typically have 2–5 dependants. Full list returned in a single response.

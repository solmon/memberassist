# Contract: Dependents & Digital ID Cards

**Module**: `DependentsModule` | Controller path: `/dependents`

All endpoints require 🔒 `JwtAuthGuard`. `memberId` is always resolved from the JWT — never
accepted from the request body.

---

## GET /dependents 🔒

Return all dependents covered under the authenticated member's active enrollment.

### Headers

```
Authorization: Bearer <accessToken>
X-Tenant-ID: <tenantId>
```

### Response `200 OK`

```json
{
  "total": 2,
  "items": [
    {
      "id": "uuid",
      "firstName": "Tommy",
      "lastName": "Doe",
      "dateOfBirth": "2012-08-20",
      "relationship": "CHILD",
      "memberIdNumber": "THRV-0001235",
      "isActive": true
    }
  ]
}
```

---

## POST /dependents 🔒

Add a new dependent to the authenticated member's plan.

### Request Body DTO

```typescript
// create-dependent.dto.ts
import {
  IsString, IsDateString, IsEnum, MinLength, MaxLength
} from 'class-validator';
import { DependentRelationship } from '@prisma/client';

export class CreateDependentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @IsDateString()
  dateOfBirth: string;          // ISO 8601 date, e.g. "2012-08-20"

  @IsEnum(DependentRelationship)
  relationship: DependentRelationship;
}
```

### Response `201 Created`

```json
{
  "id": "uuid",
  "firstName": "Lily",
  "lastName": "Doe",
  "dateOfBirth": "2016-04-01",
  "relationship": "CHILD",
  "memberIdNumber": "THRV-0001236",
  "isActive": true
}
```

### Error Responses

| Status | Code | Trigger |
|---|---|---|
| `400` | `VALIDATION_ERROR` | DTO validation failure |
| `409` | `DEPENDENT_LIMIT_REACHED` | Active dependent count >= plan limit |
| `404` | `NO_ACTIVE_ENROLLMENT` | Member has no active enrollment to add dependent to |

---

## GET /dependents/:dependentId 🔒

Return a single dependent's detail. Enforces ownership: `dependent.memberId` must match the
JWT `sub`.

### Response `200 OK`

Full dependent object with `digitalCard` embedded:

```json
{
  "id": "uuid",
  "firstName": "Tommy",
  "lastName": "Doe",
  "dateOfBirth": "2012-08-20",
  "relationship": "CHILD",
  "memberIdNumber": "THRV-0001235",
  "isActive": true,
  "digitalCard": {
    "id": "uuid",
    "cardholderName": "TOMMY DOE",
    "memberIdNumber": "THRV-0001235",
    "groupNumber": "GRP-9901",
    "planName": "Thrive Gold PPO",
    "planTier": "GOLD",
    "effectiveDate": "2025-01-01",
    "terminationDate": null
  }
}
```

### Error Responses

| Status | Code | Trigger |
|---|---|---|
| `403` | `ACCESS_DENIED` | `dependent.memberId` ≠ JWT `sub` |
| `404` | `DEPENDENT_NOT_FOUND` | No dependent with that ID in the tenant |

---

## DELETE /dependents/:dependentId 🔒

Soft-delete a dependent by setting `isActive = false`. The dependent's digital card remains
for record keeping.

### Response `204 No Content`

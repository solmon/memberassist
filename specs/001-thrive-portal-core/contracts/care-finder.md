# Contract: Care Finder & PCP Selection

**Module**: `CareModule` | Controller path: `/care`

All endpoints require 🔒 `JwtAuthGuard`. Maps to FHIR Practitioner and CareTeam resources.

---

## GET /care/providers 🔒

Search in-network providers (PCPs and specialists) for the authenticated member's tenant and
plan tier. Results ordered by distance if `latitude`/`longitude` are provided.

### Headers

```
Authorization: Bearer <accessToken>
X-Tenant-ID: <tenantId>
```

### Query Parameters DTO

```typescript
// provider-search.dto.ts
import {
  IsOptional, IsString, IsNumber, Min, Max, IsBoolean, IsInt
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ProviderSearchDto {
  @IsOptional()
  @IsString()
  specialty?: string;           // free-text filter on specialty field

  @IsOptional()
  @IsString()
  zipCode?: string;             // proximity anchor; requires lat/lng or geocoding

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  radiusMiles?: number;         // default 25

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  acceptingNew?: boolean;       // if true, filter to acceptingNew = true

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number;               // default 20

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
```

### Response `200 OK`

```json
{
  "total": 34,
  "items": [
    {
      "id": "uuid",
      "firstName": "Dr. Maria",
      "lastName": "Santos",
      "specialty": "Family Medicine",
      "clinicName": "Greenview Family Practice",
      "address": "123 Oak Street",
      "city": "Portland",
      "state": "OR",
      "zipCode": "97201",
      "phone": "+1-503-555-0100",
      "acceptingNew": true,
      "distanceMiles": 1.4
    }
  ]
}
```

`distanceMiles` is included only when `latitude` and `longitude` are provided.

### Server-Side Eligibility Filter

- `provider.tenantId` matches authenticated member's `tenantId`.
- Member's active `planTier` is included in `provider.networkTiers` JSON array.
- `provider.isActive = true`.

---

## GET /care/providers/:providerId 🔒

Return full provider profile. Validates the provider is in the member's tenant network.

### Response `200 OK`

```json
{
  "id": "uuid",
  "npi": "1234567890",
  "firstName": "Maria",
  "lastName": "Santos",
  "specialty": "Family Medicine",
  "clinicName": "Greenview Family Practice",
  "address": "123 Oak Street",
  "city": "Portland",
  "state": "OR",
  "zipCode": "97201",
  "phone": "+1-503-555-0100",
  "acceptingNew": true,
  "networkTiers": ["BRONZE", "SILVER", "GOLD", "PLATINUM"]
}
```

### Error Responses

| Status | Code | Trigger |
|---|---|---|
| `403` | `PROVIDER_OUT_OF_NETWORK` | Provider not in member's tenant |
| `404` | `PROVIDER_NOT_FOUND` | No provider with that ID |

---

## POST /care/pcp-selection 🔒

Record the authenticated member's selection of a primary care provider (PCP). Replaces any
previously selected PCP. In v1, this creates a record of the selection intent — downstream
CareTeam workflow is out of scope.

### Request Body DTO

```typescript
// pcp-change.dto.ts
import { IsUUID } from 'class-validator';

export class PcpChangeDto {
  @IsUUID()
  providerId: string;
}
```

### Response `200 OK`

```json
{
  "providerId": "uuid",
  "providerName": "Dr. Maria Santos",
  "clinicName": "Greenview Family Practice",
  "selectedAt": "2025-11-20T15:00:00Z",
  "status": "PENDING_CONFIRMATION"
}
```

### Error Responses

| Status | Code | Trigger |
|---|---|---|
| `400` | `PROVIDER_NOT_ACCEPTING` | `provider.acceptingNew = false` |
| `403` | `PROVIDER_OUT_OF_NETWORK` | Provider not eligible for member's plan tier |
| `404` | `PROVIDER_NOT_FOUND` | No provider with that ID in the tenant |

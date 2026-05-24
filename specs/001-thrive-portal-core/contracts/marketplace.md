# Contract: Provider Marketplace

**Module**: `MarketplaceModule` | Controller path: `/marketplace`

All endpoints require 🔒 `JwtAuthGuard`. Offer eligibility is evaluated server-side against
the member's active `planTier` — the client never applies eligibility logic.

---

## GET /marketplace/offers 🔒

Return marketplace offers eligible for the authenticated member's current plan tier and tenant.

### Headers

```
Authorization: Bearer <accessToken>
X-Tenant-ID: <tenantId>
```

### Query Parameters DTO

```typescript
// offer-query.dto.ts
import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { OfferCategory } from '@prisma/client';

export class OfferQueryDto {
  @IsOptional()
  @IsEnum(OfferCategory)
  category?: OfferCategory;

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
  "total": 8,
  "items": [
    {
      "id": "uuid",
      "title": "Vision Plus Add-On",
      "description": "Annual eye exam + $150 frames allowance",
      "category": "VISION",
      "priceAmount": "15.00",
      "priceCycle": "MONTHLY",
      "hasExpressedInterest": false
    }
  ]
}
```

**Filtering logic** (applied in `MarketplaceService`):
1. `tenantId` matches authenticated member's tenant.
2. Member's active `planTier` is included in `offer.eligibleTiers` JSON array.
3. `offer.isActive = true`.

---

## GET /marketplace/offers/:offerId 🔒

Return a single offer's full detail. Validates that the offer is eligible for the requesting
member before returning.

### Response `200 OK`

```json
{
  "id": "uuid",
  "title": "Vision Plus Add-On",
  "description": "Annual eye exam + $150 frames allowance. Available to Gold and Platinum tier members...",
  "category": "VISION",
  "priceAmount": "15.00",
  "priceCycle": "MONTHLY",
  "hasExpressedInterest": false,
  "eligibleTiers": ["GOLD", "PLATINUM"]
}
```

### Error Responses

| Status | Code | Trigger |
|---|---|---|
| `403` | `OFFER_NOT_ELIGIBLE` | Member's plan tier not in `eligibleTiers` |
| `404` | `OFFER_NOT_FOUND` | Offer not in tenant or `isActive = false` |

---

## POST /marketplace/offers/:offerId/interest 🔒

Record the member's expressed interest in an offer. Idempotent — second call returns `200`.
Triggers a notification to the member's broker (implementation detail for v2 notification
pipeline; v1 records the `MarketplaceInterest` row).

### Request Body DTO

```typescript
// express-interest.dto.ts
// No body required; offerId from URL, memberId + tenantId from JWT
export class ExpressInterestDto {}
```

### Response `201 Created` (first call) | `200 OK` (already expressed)

```json
{
  "offerId": "uuid",
  "expressedAt": "2025-11-15T10:00:00Z"
}
```

### Error Responses

| Status | Code | Trigger |
|---|---|---|
| `403` | `OFFER_NOT_ELIGIBLE` | Member's plan tier not eligible |
| `404` | `NO_ACTIVE_ENROLLMENT` | Cannot express interest without an active enrollment |

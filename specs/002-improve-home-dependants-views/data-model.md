# Data Model: Improve Home & Dependants Views

**Branch**: `002-improve-home-dependants-views` | **Date**: 2026-05-27

---

## Overview

This feature requires **three new columns** on the existing `PlanEnrollment` model. No new tables are introduced. All other models (`Member`, `Dependent`, `DigitalInsuranceCard`) already carry the fields needed for the simplified mobile views.

---

## Modified Model: `PlanEnrollment`

### New Columns

| Column | Type | Nullable | Default | Purpose |
|---|---|---|---|---|
| `planType` | `NVarChar(20)` | No | `'MEDICAL'` | Coverage line type. Constrained to `MEDICAL \| DENTAL \| VISION \| LIFE` at the application layer. |
| `deductibleLimit` | `Decimal(10,2)` | Yes | `null` | Annual deductible ceiling for this enrollment. `null` = plan has no deductible. |
| `deductibleMet` | `Decimal(10,2)` | Yes | `0.00` | Year-to-date amount applied toward the deductible. Updated by back-office claims process. |

### Updated Prisma Schema Fragment

```prisma
model PlanEnrollment {
  id              String    @id @default(uuid()) @db.NVarChar(36)
  tenantId        String    @db.NVarChar(36)
  memberId        String    @db.NVarChar(36)
  planName        String    @db.NVarChar(255)
  planTier        String    @db.NVarChar(20)
  planType        String    @default("MEDICAL") @db.NVarChar(20)   // NEW
  groupNumber     String    @db.NVarChar(50)
  effectiveDate   DateTime  @db.DateTime2
  terminationDate DateTime? @db.DateTime2
  status          String    @default("ACTIVE") @db.NVarChar(20)
  premiumAmount   Decimal   @db.Decimal(10, 2)
  premiumCycle    String    @default("MONTHLY") @db.NVarChar(20)
  nextRenewalDate DateTime? @db.DateTime2
  deductibleLimit Decimal?  @db.Decimal(10, 2)                     // NEW — null = no deductible
  deductibleMet   Decimal?  @default(0) @db.Decimal(10, 2)         // NEW — YTD met amount
  createdAt       DateTime  @default(now()) @db.DateTime2
  updatedAt       DateTime  @updatedAt @db.DateTime2

  member               Member                 @relation(fields: [memberId], references: [id])
  digitalCards         DigitalInsuranceCard[]
  marketplaceInterests MarketplaceInterest[]

  @@index([tenantId])
  @@index([memberId])
  @@index([tenantId, status])
  @@index([memberId, status])
  @@index([tenantId, planType])          // NEW — supports filtering by coverage type
}
```

### Migration Notes

- `planType` is non-nullable with a default of `'MEDICAL'`. The migration will backfill all existing rows with `'MEDICAL'`. Review seeded data and update rows with correct plan types post-migration.
- `deductibleLimit` is nullable with no default. Existing rows will have `NULL`; the mobile UI correctly hides the deductible row when `null`.
- `deductibleMet` is nullable with a default of `0`. Existing rows will have `0.00`.

---

## Unchanged Models (Read-Only for This Feature)

### `Member` — fields used in plan-summary response

| Field | Type | Notes |
|---|---|---|
| `id` | `NVarChar(36)` | Internal identifier |
| `firstName` | `NVarChar(100)` | Displayed on Home hero + plan card |
| `lastName` | `NVarChar(100)` | Displayed on plan card |
| `memberIdNumber` | `NVarChar(50)` | Displayed on plan card |
| `tenantId` | `NVarChar(36)` | Tenant isolation key — always included in WHERE clause |

Fields intentionally **excluded** from mobile API responses: `passwordHash`, `email`, `dateOfBirth`, `phone`, `districtId`.

---

### `Dependent` — fields used in dependants response

| Field | Type | Notes |
|---|---|---|
| `id` | `NVarChar(36)` | Used as list item key |
| `firstName` | `NVarChar(100)` | Displayed in list |
| `lastName` | `NVarChar(100)` | Displayed in list |
| `dateOfBirth` | `DateTime2` | Used by mobile client to calculate age; raw DOB not rendered |
| `relationship` | `NVarChar(30)` | Displayed as label (SPOUSE / CHILD / DOMESTIC_PARTNER / OTHER) |
| `isActive` | `bit` | Filters list to active-only; drives status badge |
| `memberIdNumber` | `NVarChar(50)` | Shown on digital ID card |
| `tenantId` | `NVarChar(36)` | Tenant isolation key |

---

### `DigitalInsuranceCard` — fields used in dependant detail (card view)

| Field | Type | Notes |
|---|---|---|
| `id` | `NVarChar(36)` | Card record identifier |
| `cardholderName` | `NVarChar(255)` | Printed name on card |
| `memberIdNumber` | `NVarChar(50)` | Member ID on card |
| `groupNumber` | `NVarChar(50)` | Group number on card |
| `planName` | `NVarChar(255)` | Plan name on card |
| `effectiveDate` | `DateTime2` | Coverage start date on card |
| `terminationDate` | `DateTime2?` | Coverage end date on card (null = ongoing) |
| `dependentId` | `NVarChar(36)?` | FK to `Dependent`; null = primary member card |

---

## Entity Relationships (This Feature's View)

```
Member (1)
  └── PlanEnrollment (1..*) [tenantId, memberId]
        └── DigitalInsuranceCard (0..*) [enrollmentId]
                                             ▲
  └── Dependent (0..*) [tenantId, memberId]  │
        └──────────────────────────── digitalCards [dependentId?]
```

A `DigitalInsuranceCard` is linked to exactly one `PlanEnrollment` and optionally to one `Dependent`. When `dependentId` is set, it is the dependant's individual card. When null, it is the primary member's card for that enrollment.

---

## Validation Rules (Application Layer)

| Field | Rule |
|---|---|
| `planType` | `@IsIn(['MEDICAL', 'DENTAL', 'VISION', 'LIFE'])` on create/update DTOs |
| `deductibleLimit` | `@IsOptional() @IsDecimal() @Min(0)` |
| `deductibleMet` | `@IsOptional() @IsDecimal() @Min(0)` |
| `premiumAmount` | Existing validation — `@IsDecimal() @Min(0)` |

---

## State Transitions

`PlanEnrollment.status` values relevant to the mobile UI:

| Value | Display | Badge colour |
|---|---|---|
| `ACTIVE` | Active | `theme.colors.primary` (green-ish in default MD3) |
| `INACTIVE` | Inactive | `theme.colors.secondary` |
| `TERMINATED` | Terminated | `theme.colors.error` |
| `PENDING` | Pending | `theme.colors.tertiary` |

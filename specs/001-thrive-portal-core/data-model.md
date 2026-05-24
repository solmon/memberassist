# Data Model: Thrive Portal — Core Member Application

**Phase 1 output** | Branch: `001-thrive-portal-core` | Date: 2026-05-22

All models comply with Constitution Principle V: explicit `tenantId` FK, `@@index` on all
WHERE/JOIN columns, `@relation` directives, `@db.NVarChar`/`@db.DateTime2` columns,
`@default(uuid())` PKs.

---

## Prisma Schema (`api/prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}

// ─────────────────────────────────────────────────────────────────
// MULTI-TENANCY FOUNDATION
// ─────────────────────────────────────────────────────────────────

model Tenant {
  id             String   @id @default(uuid()) @db.NVarChar(36)
  name           String   @db.NVarChar(255)
  slug           String   @unique @db.NVarChar(100)
  logoUrl        String?  @db.NVarChar(Max)
  primaryColour  String?  @db.NVarChar(7)      // hex, e.g. #1A73E8
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now()) @db.DateTime2
  updatedAt      DateTime @updatedAt @db.DateTime2

  districts      District[]
  brokers        Broker[]
  members        Member[]
  marketplaceOffers MarketplaceOffer[]
  healthEvents   HealthEvent[]

  @@index([slug])
  @@index([isActive])
}

model District {
  id           String   @id @default(uuid()) @db.NVarChar(36)
  tenantId     String   @db.NVarChar(36)
  name         String   @db.NVarChar(255)
  description  String?  @db.NVarChar(Max)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now()) @db.DateTime2
  updatedAt    DateTime @updatedAt @db.DateTime2

  tenant       Tenant   @relation(fields: [tenantId], references: [id])
  members      Member[]
  messages     CommunicationMessage[]

  @@index([tenantId])
  @@index([tenantId, isActive])
}

// ─────────────────────────────────────────────────────────────────
// BROKER
// ─────────────────────────────────────────────────────────────────

model Broker {
  id           String   @id @default(uuid()) @db.NVarChar(36)
  tenantId     String   @db.NVarChar(36)
  name         String   @db.NVarChar(255)
  licenceNumber String  @db.NVarChar(50)
  email        String   @db.NVarChar(255)
  phone        String?  @db.NVarChar(20)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now()) @db.DateTime2
  updatedAt    DateTime @updatedAt @db.DateTime2

  tenant       Tenant   @relation(fields: [tenantId], references: [id])
  messages     CommunicationMessage[]

  @@index([tenantId])
  @@index([tenantId, isActive])
  @@index([email])
}

// ─────────────────────────────────────────────────────────────────
// MEMBER (core identity — maps to FHIR Patient resource)
// ─────────────────────────────────────────────────────────────────

model Member {
  id              String   @id @default(uuid()) @db.NVarChar(36)
  tenantId        String   @db.NVarChar(36)
  districtId      String?  @db.NVarChar(36)
  email           String   @db.NVarChar(255)
  passwordHash    String   @db.NVarChar(Max)   // bcrypt hash — NEVER plaintext
  firstName       String   @db.NVarChar(100)
  lastName        String   @db.NVarChar(100)
  dateOfBirth     DateTime @db.DateTime2
  memberIdNumber  String   @unique @db.NVarChar(50)  // plan member ID (printable on card)
  phone           String?  @db.NVarChar(20)
  role            MemberRole @default(MEMBER)
  isActive        Boolean  @default(true)
  lastLoginAt     DateTime? @db.DateTime2
  createdAt       DateTime @default(now()) @db.DateTime2
  updatedAt       DateTime @updatedAt @db.DateTime2

  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  district        District? @relation(fields: [districtId], references: [id])
  enrollments     PlanEnrollment[]
  dependents      Dependent[]
  refreshTokens   RefreshToken[]

  @@index([tenantId])
  @@index([tenantId, email])
  @@index([tenantId, isActive])
  @@index([memberIdNumber])
}

enum MemberRole {
  MEMBER
  ADMIN
  BROKER_PORTAL
}

model RefreshToken {
  id          String   @id @default(uuid()) @db.NVarChar(36)
  memberId    String   @db.NVarChar(36)
  tokenHash   String   @db.NVarChar(Max)    // bcrypt hash of the raw refresh token
  expiresAt   DateTime @db.DateTime2
  revokedAt   DateTime? @db.DateTime2
  createdAt   DateTime @default(now()) @db.DateTime2

  member      Member   @relation(fields: [memberId], references: [id])

  @@index([memberId])
  @@index([memberId, revokedAt])
}

// ─────────────────────────────────────────────────────────────────
// PLAN ENROLLMENT (maps to FHIR Coverage resource)
// ─────────────────────────────────────────────────────────────────

model PlanEnrollment {
  id              String   @id @default(uuid()) @db.NVarChar(36)
  tenantId        String   @db.NVarChar(36)
  memberId        String   @db.NVarChar(36)
  planName        String   @db.NVarChar(255)
  planTier        PlanTier
  groupNumber     String   @db.NVarChar(50)
  effectiveDate   DateTime @db.DateTime2
  terminationDate DateTime? @db.DateTime2
  status          EnrollmentStatus @default(ACTIVE)
  premiumAmount   Decimal  @db.Decimal(10, 2)
  premiumCycle    PremiumCycle @default(MONTHLY)
  nextRenewalDate DateTime? @db.DateTime2
  createdAt       DateTime @default(now()) @db.DateTime2
  updatedAt       DateTime @updatedAt @db.DateTime2

  member          Member   @relation(fields: [memberId], references: [id])
  digitalCards    DigitalInsuranceCard[]
  marketplaceInterests MarketplaceInterest[]

  @@index([tenantId])
  @@index([memberId])
  @@index([tenantId, status])
  @@index([memberId, status])
}

enum PlanTier {
  BRONZE
  SILVER
  GOLD
  PLATINUM
}

enum EnrollmentStatus {
  ACTIVE
  PENDING
  TERMINATED
  SUSPENDED
}

enum PremiumCycle {
  MONTHLY
  QUARTERLY
  ANNUAL
}

// ─────────────────────────────────────────────────────────────────
// DEPENDENT (maps to FHIR RelatedPerson + Coverage.dependent)
// ─────────────────────────────────────────────────────────────────

model Dependent {
  id              String   @id @default(uuid()) @db.NVarChar(36)
  tenantId        String   @db.NVarChar(36)
  memberId        String   @db.NVarChar(36)
  firstName       String   @db.NVarChar(100)
  lastName        String   @db.NVarChar(100)
  dateOfBirth     DateTime @db.DateTime2
  relationship    DependentRelationship
  memberIdNumber  String   @unique @db.NVarChar(50)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now()) @db.DateTime2
  updatedAt       DateTime @updatedAt @db.DateTime2

  member          Member   @relation(fields: [memberId], references: [id])
  digitalCards    DigitalInsuranceCard[]

  @@index([tenantId])
  @@index([memberId])
  @@index([tenantId, memberId])
  @@index([tenantId, isActive])
}

enum DependentRelationship {
  SPOUSE
  CHILD
  DOMESTIC_PARTNER
  OTHER
}

// ─────────────────────────────────────────────────────────────────
// DIGITAL INSURANCE CARD (cached display artefact)
// ─────────────────────────────────────────────────────────────────

model DigitalInsuranceCard {
  id               String   @id @default(uuid()) @db.NVarChar(36)
  tenantId         String   @db.NVarChar(36)
  enrollmentId     String   @db.NVarChar(36)
  dependentId      String?  @db.NVarChar(36)    // null = card for the primary member
  cardholderName   String   @db.NVarChar(255)
  memberIdNumber   String   @db.NVarChar(50)
  groupNumber      String   @db.NVarChar(50)
  planName         String   @db.NVarChar(255)
  planTier         PlanTier
  effectiveDate    DateTime @db.DateTime2
  terminationDate  DateTime? @db.DateTime2
  issuedAt         DateTime @default(now()) @db.DateTime2

  enrollment       PlanEnrollment @relation(fields: [enrollmentId], references: [id])
  dependent        Dependent?     @relation(fields: [dependentId], references: [id])

  @@index([tenantId])
  @@index([enrollmentId])
  @@index([dependentId])
}

// ─────────────────────────────────────────────────────────────────
// COMMUNICATION MESSAGE (broker notices + district alerts)
// ─────────────────────────────────────────────────────────────────

model CommunicationMessage {
  id            String   @id @default(uuid()) @db.NVarChar(36)
  tenantId      String   @db.NVarChar(36)
  channel       MessageChannel
  brokerId      String?  @db.NVarChar(36)    // set when channel = BROKER_NOTICE
  districtId    String?  @db.NVarChar(36)    // set when channel = DISTRICT_ALERT
  recipientMemberId String? @db.NVarChar(36) // null = broadcast to all members in tenant
  subject       String   @db.NVarChar(500)
  body          String   @db.NVarChar(Max)
  sentAt        DateTime @default(now()) @db.DateTime2
  readAt        DateTime? @db.DateTime2

  broker        Broker?   @relation(fields: [brokerId], references: [id])
  district      District? @relation(fields: [districtId], references: [id])

  @@index([tenantId])
  @@index([tenantId, channel])
  @@index([tenantId, recipientMemberId])
  @@index([tenantId, recipientMemberId, readAt])
}

enum MessageChannel {
  BROKER_NOTICE
  DISTRICT_ALERT
}

// ─────────────────────────────────────────────────────────────────
// MARKETPLACE OFFER
// ─────────────────────────────────────────────────────────────────

model MarketplaceOffer {
  id              String   @id @default(uuid()) @db.NVarChar(36)
  tenantId        String   @db.NVarChar(36)
  title           String   @db.NVarChar(255)
  description     String   @db.NVarChar(Max)
  category        OfferCategory
  eligibleTiers   String   @db.NVarChar(Max)  // JSON array: ["GOLD","PLATINUM"]
  priceAmount     Decimal? @db.Decimal(10, 2)
  priceCycle      PremiumCycle?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now()) @db.DateTime2
  updatedAt       DateTime @updatedAt @db.DateTime2

  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  interests       MarketplaceInterest[]

  @@index([tenantId])
  @@index([tenantId, isActive])
  @@index([tenantId, category])
}

enum OfferCategory {
  DENTAL
  VISION
  WELLNESS
  MENTAL_HEALTH
  PHARMACY
  OTHER
}

model MarketplaceInterest {
  id           String   @id @default(uuid()) @db.NVarChar(36)
  tenantId     String   @db.NVarChar(36)
  offerId      String   @db.NVarChar(36)
  enrollmentId String   @db.NVarChar(36)
  expressedAt  DateTime @default(now()) @db.DateTime2

  offer        MarketplaceOffer @relation(fields: [offerId], references: [id])
  enrollment   PlanEnrollment   @relation(fields: [enrollmentId], references: [id])

  @@unique([offerId, enrollmentId])
  @@index([tenantId])
  @@index([offerId])
  @@index([enrollmentId])
}

// ─────────────────────────────────────────────────────────────────
// HEALTH EVENT & RSVP
// ─────────────────────────────────────────────────────────────────

model HealthEvent {
  id           String   @id @default(uuid()) @db.NVarChar(36)
  tenantId     String   @db.NVarChar(36)
  title        String   @db.NVarChar(255)
  description  String   @db.NVarChar(Max)
  category     EventCategory
  location     String?  @db.NVarChar(500)
  isVirtual    Boolean  @default(false)
  meetingUrl   String?  @db.NVarChar(Max)
  startAt      DateTime @db.DateTime2
  endAt        DateTime @db.DateTime2
  capacity     Int?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now()) @db.DateTime2
  updatedAt    DateTime @updatedAt @db.DateTime2

  tenant       Tenant   @relation(fields: [tenantId], references: [id])
  rsvps        EventRsvp[]

  @@index([tenantId])
  @@index([tenantId, startAt])
  @@index([tenantId, isActive])
}

enum EventCategory {
  WELLNESS
  PREVENTIVE_CARE
  MENTAL_HEALTH
  NUTRITION
  FITNESS
  COMMUNITY
  OPEN_ENROLLMENT
  OTHER
}

model EventRsvp {
  id           String   @id @default(uuid()) @db.NVarChar(36)
  tenantId     String   @db.NVarChar(36)
  eventId      String   @db.NVarChar(36)
  memberId     String   @db.NVarChar(36)
  status       RsvpStatus @default(ATTENDING)
  registeredAt DateTime @default(now()) @db.DateTime2
  cancelledAt  DateTime? @db.DateTime2

  event        HealthEvent @relation(fields: [eventId], references: [id])

  @@unique([eventId, memberId])
  @@index([tenantId])
  @@index([eventId])
  @@index([memberId])
  @@index([tenantId, memberId])
}

enum RsvpStatus {
  ATTENDING
  WAITLISTED
  CANCELLED
}

// ─────────────────────────────────────────────────────────────────
// PROVIDER (PCP / Care Finder — maps to FHIR Practitioner resource)
// ─────────────────────────────────────────────────────────────────

model Provider {
  id              String   @id @default(uuid()) @db.NVarChar(36)
  tenantId        String   @db.NVarChar(36)
  npi             String   @db.NVarChar(20)        // National Provider Identifier
  firstName       String   @db.NVarChar(100)
  lastName        String   @db.NVarChar(100)
  specialty       String   @db.NVarChar(255)
  clinicName      String?  @db.NVarChar(255)
  address         String   @db.NVarChar(Max)
  city            String   @db.NVarChar(100)
  state           String   @db.NVarChar(50)
  zipCode         String   @db.NVarChar(10)
  phone           String?  @db.NVarChar(20)
  acceptingNew    Boolean  @default(true)
  networkTiers    String   @db.NVarChar(Max)       // JSON array: ["BRONZE","SILVER","GOLD","PLATINUM"]
  latitude        Decimal? @db.Decimal(9, 6)
  longitude       Decimal? @db.Decimal(9, 6)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now()) @db.DateTime2
  updatedAt       DateTime @updatedAt @db.DateTime2

  @@index([tenantId])
  @@index([tenantId, acceptingNew])
  @@index([tenantId, specialty])
  @@index([npi])
  @@index([zipCode])
}
```

---

## Entity Summary

| Entity | Description | Key Relationships |
|---|---|---|
| `Tenant` | Organisation / health plan issuer | Parent of everything |
| `District` | Sub-unit of tenant (school district, employer group) | → Tenant |
| `Broker` | Licensed insurance broker serving a tenant | → Tenant |
| `Member` | Primary account holder; maps to FHIR Patient | → Tenant, District |
| `RefreshToken` | Hashed refresh token for token rotation | → Member |
| `PlanEnrollment` | Active/historical plan coverage; maps to FHIR Coverage | → Member |
| `Dependent` | Family member covered under a member's plan | → Member |
| `DigitalInsuranceCard` | Generated card artefact for display/sharing | → PlanEnrollment, Dependent |
| `CommunicationMessage` | Broker notice or district alert | → Broker / District |
| `MarketplaceOffer` | Supplemental product available to eligible members | → Tenant |
| `MarketplaceInterest` | Member's expressed interest in an offer | → MarketplaceOffer, PlanEnrollment |
| `HealthEvent` | Wellness event, open enrolment session, virtual health day | → Tenant |
| `EventRsvp` | Member's registration for a health event | → HealthEvent |
| `Provider` | In-network doctor/PCP; maps to FHIR Practitioner | → Tenant |

---

## Validation Rules

| Entity | Field | Rule |
|---|---|---|
| `Member` | `email` | RFC 5321 format; unique within tenant |
| `Member` | `passwordHash` | Never stored plaintext; bcrypt cost ≥ 12 |
| `Member` | `dateOfBirth` | Must be in the past; age ≥ 18 for primary account holder |
| `Dependent` | `dateOfBirth` | Must be in the past |
| `PlanEnrollment` | `terminationDate` | If set, must be ≥ `effectiveDate` |
| `HealthEvent` | `endAt` | Must be > `startAt` |
| `MarketplaceOffer` | `eligibleTiers` | Valid JSON array of `PlanTier` values |
| `Provider` | `npi` | 10-digit NPI format (validated at service layer) |
| `RefreshToken` | `expiresAt` | Must be in the future at creation time |

---

## State Transitions

### PlanEnrollment.status

```
PENDING → ACTIVE      (plan activated after payment confirmation)
ACTIVE  → SUSPENDED   (non-payment or compliance hold)
ACTIVE  → TERMINATED  (voluntary termination or plan end-of-life)
SUSPENDED → ACTIVE    (payment resolved)
SUSPENDED → TERMINATED
```

### EventRsvp.status

```
ATTENDING  → CANCELLED  (member cancels; seat released from capacity count)
WAITLISTED → ATTENDING  (capacity opens up)
WAITLISTED → CANCELLED
```

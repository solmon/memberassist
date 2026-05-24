# Tasks: Thrive Portal — Core Member Application

**Input**: Design documents from `specs/001-thrive-portal-core/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Format**: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- **[P]**: Parallelizable — operates on a different file with no dependency on incomplete tasks in the same phase
- **[Story]**: User story label — required for Phase 3+ tasks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize both projects, configure Docker, Prisma schema, and tooling. No user story work until this phase is complete.

- [X] T001 Initialize `api/` NestJS project: `npx @nestjs/cli new api` and install all back-end dependencies (`@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `@prisma/client`, `prisma`, `class-validator`, `class-transformer`, `bcrypt`, `@nestjs/swagger`)
- [X] T002 [P] Initialize `mobile/` Expo project: `npx create-expo-app mobile --template` and install all front-end dependencies (`react-native-paper`, `react-native-web`, `zustand`, `@reduxjs/toolkit`, `react-query`, `expo-secure-store`, `expo-router`)
- [X] T003 Create `docker-compose.yml` at repo root with pinned `mcr.microsoft.com/mssql/server:2022-CU12-ubuntu-22.04` MSSQL service (health check via `/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P ... -Q "SELECT 1" -No -C`) and NestJS `api` service (`depends_on: mssql: condition: service_healthy`)
- [X] T004 [P] Create `api/Dockerfile` — multi-stage build: `node:22-alpine3.20` builder (npm ci, prisma generate, npm run build) + `node:22-alpine3.20` runner (copy dist, node_modules, prisma; EXPOSE 3000)
- [X] T005 [P] Create `api/.env.example` with variables: `DATABASE_URL`, `SHADOW_DATABASE_URL`, `MSSQL_SA_PASSWORD`, `JWT_SECRET`, `JWT_ACCESS_TTL=900`, `JWT_REFRESH_TTL=2592000`, `NODE_ENV`, `PORT=3000`
- [X] T006 [P] Configure `api/tsconfig.json` (`strict: true`, `strictNullChecks: true`, `noImplicitAny: true`) and `api/nest-cli.json`
- [X] T007 [P] Configure `mobile/tsconfig.json` (`strict: true`, `strictNullChecks: true`) and `mobile/app.json` (Expo config with `ios`, `android`, `web` targets)
- [X] T008 Create `api/prisma/schema.prisma` with `provider = "sqlserver"`, all 14 models (`Tenant`, `District`, `Broker`, `Member`, `RefreshToken`, `PlanEnrollment`, `Dependent`, `DigitalInsuranceCard`, `CommunicationMessage`, `MarketplaceOffer`, `MarketplaceInterest`, `HealthEvent`, `EventRsvp`, `Provider`), all enums, `@db.NVarChar`/`@db.DateTime2` column types, UUID PKs (`@default(uuid())`), and `@@index` on all WHERE/JOIN columns per `data-model.md`
- [ ] T009 Run `cd api && npx prisma migrate dev --name init` to apply the initial MSSQL migration and commit the generated `api/prisma/migrations/` folder

**Checkpoint**: Both projects initialized, Docker Compose functional, schema migrated — user story work can begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented. Covers PrismaService, app bootstrap, JWT strategy, global guards, HIPAA interceptor, Zustand stores, and mobile API client.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T010 Create `api/src/prisma/prisma.service.ts` implementing `PrismaClient` with `onModuleInit()` retry loop (10 attempts, 3-second delay per research decision R-03) and `api/src/prisma/prisma.module.ts` exporting `PrismaService`
- [X] T011 Create `api/src/app.module.ts` — root module that imports `PrismaModule`; placeholder for feature module imports (wired in Phase 10 T081)
- [X] T012 [P] Create `api/src/main.ts` — NestJS bootstrap: register global `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`), global `JwtAuthGuard`, global `PhiRedactionInterceptor`, Swagger `DocumentBuilder` (title, version, bearer auth), `app.listen(process.env.PORT ?? 3000)`
- [X] T013 Create `api/src/modules/auth/strategies/jwt.strategy.ts` — `PassportStrategy(Strategy)` extracting `Authorization: Bearer` header, validating JWT, returning payload `{ sub: memberId, tenantId, role }`; register `JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: 900 } })` configuration
- [X] T014 [P] Create `api/src/common/guards/jwt-auth.guard.ts` — `@Injectable() JwtAuthGuard extends AuthGuard('jwt')` used as global guard in `main.ts`; create `api/src/common/decorators/public.decorator.ts` (`@Public()` metadata key to skip the guard on login/refresh endpoints)
- [X] T015 [P] Create `api/src/common/decorators/tenant-id.decorator.ts` — `@TenantId()` parameter decorator that extracts `request.user.tenantId` from the JWT payload (per research decision R-02)
- [X] T016 [P] Create `api/src/common/interceptors/phi-redaction.interceptor.ts` — `NestInterceptor` that strips fields (`email`, `ssn`, `dob`, `memberNumber`, `dateOfBirth`, `phone`) from response bodies before they reach the logger (HIPAA, per research decision R-08)
- [X] T017 Create `mobile/app/_layout.tsx` — Root Expo Router layout: wrap app in `<PaperProvider theme={theme}>`, integrate Zustand store hydration, define `(auth)` vs `(app)` route groups with auth guard (redirect unauthenticated users to `/(auth)/login`)
- [X] T018 [P] Create `mobile/src/theme/theme.ts` — MD3 `configureFonts` + `MD3LightTheme` with tenant-overridable primary/secondary color slots; export `AppTheme` type for `useTheme<AppTheme>()` usage throughout the app
- [X] T019 [P] Create `mobile/src/store/authStore.ts` — Zustand store: `{ accessToken, refreshToken, user: { id, email, tenantId, role } | null, setAuth(tokens, user), clearAuth() }`; persist `accessToken`/`refreshToken` to `expo-secure-store`
- [X] T020 [P] Create `mobile/src/store/tenantStore.ts` — Zustand store: `{ slug, displayName, brandingColor, features: string[] } | null`, `setTenant(config)`, `clearTenant()`; apply `brandingColor` to `theme.colors.primary` at runtime
- [X] T021 Create `mobile/src/api/apiClient.ts` — Axios instance with `baseURL` from env, request interceptor injecting `Authorization: Bearer <accessToken>` from `authStore`, response interceptor catching 401s to call `POST /auth/refresh` once then retry; on second 401 call `authStore.clearAuth()` and redirect to login
- [X] T022 Create `mobile/app/(app)/_layout.tsx` — Expo Router bottom tab navigator with six tabs: Home, Dependents, Inbox (with `UnreadBadge` placeholder), Marketplace, Events, Care Finder; each tab icon from `react-native-paper` icons; `useTheme()` for tab bar colors

**Checkpoint**: Foundation complete — all 7 user stories can now be implemented in parallel

---

## Phase 3: User Story 1 — Tenant-Scoped Member Sign-In & Identity (Priority: P1) 🎯 MVP

**Goal**: Members can log in, their tenantId is resolved, tenant branding is applied, and they land on a tenant-scoped home screen.

**Independent Test**: Log in as `jane.doe@example.com` (tenant: `demo-health`). Confirm JWT is issued, `tenantStore` is populated with `demo-health` branding, and home screen title reflects the tenant. Create a second tenant + member; log in and confirm isolation — different branding, no cross-tenant data visible.

### Back-End — Auth Module

- [X] T023 [P] [US1] Create `api/src/modules/auth/dto/login.dto.ts` (LoginDto: `@IsEmail() email`, `@IsString() password`, `@IsString() tenantSlug`) and `api/src/modules/auth/dto/token-response.dto.ts` (TokenResponseDto: `accessToken`, `refreshToken`, `expiresIn: 900`)
- [X] T024 [P] [US1] Create `api/src/modules/tenants/dto/tenant-config.dto.ts` (TenantConfigDto: `id`, `name`, `slug`, `brandingColor`, `features: string[]`, `districtName?: string`)
- [X] T025 [P] [US1] Create `api/src/modules/members/dto/member-profile.dto.ts` (MemberProfileDto: `id`, `firstName`, `lastName`, `email`, `role`, `tenantId`) and `api/src/modules/members/dto/update-member.dto.ts` (PartialType of MemberProfileDto minus `id`, `tenantId`, `role`)
- [X] T026 [US1] Create `api/src/modules/tenants/tenants.service.ts` — `findBySlug(slug: string)` returns `Tenant` (throws `NotFoundException` if not found); `getConfig(tenantId: string)` returns `TenantConfigDto`; all Prisma queries scoped by `tenantId`
- [X] T027 [US1] Create `api/src/modules/tenants/tenants.module.ts` exporting `TenantsService`; create `api/src/modules/tenants/tenants.controller.ts` (no direct HTTP routes — service is consumed by AuthModule and MembersModule)
- [X] T028 [US1] Create `api/src/modules/auth/auth.service.ts` — `login(dto: LoginDto)`: resolve tenant by slug, find member by email+tenantId, `bcrypt.compare` password (cost 12), issue access token (`sub`, `tenantId`, `role`, TTL 900s) + refresh token (UUID, stored hashed with bcrypt, TTL 30 days); `refresh(token)`: validate hashed refresh token, rotate (revoke old, issue new pair); `logout(memberId)`: revoke all active refresh tokens for member; `getMe(memberId, tenantId)`: return member profile
- [X] T029 [US1] Create `api/src/modules/auth/auth.controller.ts` — `@Controller('auth')`: `POST /auth/login` (`@Public()`), `POST /auth/refresh` (`@Public()`), `POST /auth/logout` 🔒, `GET /auth/me` 🔒; apply `@TenantId()` on secured endpoints
- [X] T030 [US1] Create `api/src/modules/auth/auth.module.ts` — import `JwtModule.register({...})`, `PassportModule`, `PrismaModule`, `TenantsModule`; export `AuthService`

### Back-End — Members Module

- [X] T031 [US1] Create `api/src/modules/members/members.service.ts` — `getProfile(memberId, tenantId)`: return member with `activeEnrollment` (latest ACTIVE PlanEnrollment) embedded; `updateProfile(memberId, tenantId, dto)`: patch allowed fields; `getTenantConfig(tenantId)`: delegate to `TenantsService.getConfig`; all queries include `where: { id: memberId, tenantId }` guard
- [X] T032 [US1] Create `api/src/modules/members/members.controller.ts` — `@Controller('members')` `@UseGuards(JwtAuthGuard)`: `GET /members/profile`, `PATCH /members/profile`, `GET /members/tenant-config`; extract `memberId` from `@Request() req.user.sub`, `tenantId` from `@TenantId()`
- [X] T033 [US1] Create `api/src/modules/members/members.module.ts` importing `PrismaModule`, `TenantsModule`

### Mobile — US1

- [X] T034 [P] [US1] Create `mobile/src/api/authApi.ts` — RTK Query service: `login(LoginDto)`, `refresh({ refreshToken })`, `logout()`, `getMe()` endpoints; store returned tokens in `authStore` via `onQueryStarted`
- [X] T035 [P] [US1] Create `mobile/src/hooks/useAuth.ts` — custom hook wrapping `authStore`: returns `{ user, isAuthenticated, login, logout, isLoading, error }`, calls `authApi.login`, persists tokens to `expo-secure-store`, populates `authStore`
- [X] T036 [P] [US1] Create `mobile/src/hooks/useTenantConfig.ts` — custom hook that calls `GET /members/tenant-config` via RTK Query after login, populates `tenantStore` with `displayName`, `brandingColor`, `features`; triggers theme color override
- [X] T037 [US1] Create `mobile/app/(auth)/login.tsx` — RNP `<TextInput>` for email (keyboardType `email-address`) and password (`secureTextEntry`); RNP `<Button>` triggering `useAuth.login`; `<Snackbar>` for error display; on success navigate to `/(app)/home`; NO hardcoded hex — all colors via `useTheme()`
- [X] T038 [US1] Update `mobile/app/(app)/home.tsx` — render tenant-branded `<Surface>` with `displayName` from `tenantStore`, member first name greeting from `authStore.user`, and placeholder cards for Plan Overview, Inbox badge, Quick Links

**Checkpoint**: User Story 1 complete — authenticated session, tenant isolation, branded home screen fully functional

---

## Phase 4: User Story 2 — Subscription & Plan Overview (Priority: P2)

**Goal**: Authenticated members see their active plan tier, premium, deductible progress, coverage dates, and payment history.

**Independent Test**: Log in as seeded member. Navigate to Plan Overview. Confirm: plan tier chip shows "Gold", monthly premium, deductible progress bar (amount met / annual limit), coverage effective/expiry dates, and at least one historical payment row are all displayed correctly.

### Back-End — Plans Module

- [X] T039 [P] [US2] Create `api/src/modules/plans/dto/enrollment.dto.ts` — `EnrollmentDto` (id, planTier, monthlyPremium, effectiveDate, expiryDate, deductibleMet, deductibleLimit, status), `EnrollmentHistoryQueryDto` (`@IsOptional() page`, `@IsOptional() limit`), `DigitalCardDto` (memberId, memberNumber, groupNumber, planTier, effectiveDate)
- [X] T040 [US2] Create `api/src/modules/plans/plans.service.ts` — `getEnrollment(memberId, tenantId)`: return active `PlanEnrollment` for member; `getEnrollmentHistory(memberId, tenantId, query)`: paginated list of all enrollments ordered by effectiveDate desc; `getDigitalCard(memberId, tenantId)`: return active enrollment's `DigitalInsuranceCard`; all queries `where: { memberId, tenantId }`
- [X] T041 [US2] Create `api/src/modules/plans/plans.controller.ts` — `@Controller('plans')` `@UseGuards(JwtAuthGuard)`: `GET /plans/enrollment`, `GET /plans/enrollment/history`, `GET /plans/enrollment/card`
- [X] T042 [US2] Create `api/src/modules/plans/plans.module.ts` importing `PrismaModule`

### Mobile — US2

- [X] T043 [P] [US2] Create `mobile/src/api/plansApi.ts` — RTK Query: `getEnrollment()`, `getEnrollmentHistory(page?, limit?)`, `getDigitalCard()` endpoints; cache tags `['Enrollment']`
- [X] T044 [P] [US2] Create `mobile/src/hooks/usePlanOverview.ts` — wraps `plansApi.getEnrollment`; computes `deductiblePercent = deductibleMet / deductibleLimit * 100`; returns `isRenewalPending` flag (expiryDate within 30 days); returns `planTierLabel`
- [X] T045 [P] [US2] Create `mobile/src/components/PlanTierChip.tsx` — RNP `<Chip>` with tier label and tier-specific background color token from `useTheme()` (Gold → `primary`, Silver → `secondary`, HDHP → `tertiary`); accepts `tier: PlanTier` prop
- [X] T046 [US2] Update `mobile/app/(app)/home.tsx` — replace placeholder cards with real plan data: `PlanTierChip`, premium amount, RNP `<ProgressBar>` for deductible, coverage date range, conditional renewal `<Banner>` if `isRenewalPending`; add "Payment History" section listing `EnrollmentHistory` rows

**Checkpoint**: User Story 2 complete — full plan overview screen functional and independently testable

---

## Phase 5: User Story 3 — Dependents & Digital ID Cards (Priority: P3)

**Goal**: Members can list, add, and view digital insurance cards for dependents.

**Independent Test**: Authenticate as seeded member. Add a new dependent (name, dob, relationship). Confirm dependent appears in the list. Tap the dependent's digital card — verify member name, member ID, group number, plan tier, and effective date are displayed correctly. Attempt to add a dependent with missing required fields and confirm validation error.

### Back-End — Dependents Module

- [X] T047 [P] [US3] Create `api/src/modules/dependents/dto/create-dependent.dto.ts` (`@IsString() firstName`, `@IsString() lastName`, `@IsDateString() dateOfBirth`, `@IsEnum(DependentRelationship) relationship`, `@IsUUID() enrollmentId`) and `api/src/modules/dependents/dto/dependent.dto.ts` (DependentDto with embedded `digitalCard?: DigitalCardDto`)
- [X] T048 [US3] Create `api/src/modules/dependents/dependents.service.ts` — `listForMember(memberId, tenantId)`: return all non-deleted dependents; `create(memberId, tenantId, dto)`: create dependent + generate `DigitalInsuranceCard` from active enrollment; `findOneWithCard(dependentId, memberId, tenantId)`: return dependent with embedded card; `softDelete(dependentId, memberId, tenantId)`: set `deletedAt = now()`; enforce `tenantId` on all queries
- [X] T049 [US3] Create `api/src/modules/dependents/dependents.controller.ts` — `@Controller('dependents')` `@UseGuards(JwtAuthGuard)`: `GET /dependents`, `POST /dependents`, `GET /dependents/:id`, `DELETE /dependents/:id`
- [X] T050 [US3] Create `api/src/modules/dependents/dependents.module.ts` importing `PrismaModule`

### Mobile — US3

- [X] T051 [P] [US3] Create `mobile/src/api/dependentsApi.ts` — RTK Query: `getDependents()`, `createDependent(CreateDependentDto)`, `getDependent(id)`, `deleteDependent(id)` endpoints; invalidate `['Dependents']` tag on mutation
- [X] T052 [P] [US3] Create `mobile/src/components/DigitalIdCard.tsx` — RNP `<Card>` styled as an insurance card; props: `{ memberName, memberId, groupNumber, planTier, effectiveDate }`; displays `PlanTierChip`; includes a "Share / Save" action using Expo `Sharing` API; all colors via `useTheme()`
- [X] T053 [US3] Create `mobile/app/(app)/dependents.tsx` — RNP `<List.Section>` for each dependent row, FAB for "Add Dependent" opening a `<Portal>` modal with create form (`TextInput`, `DatePicker`, `SegmentedButtons` for relationship); on row press show `DigitalIdCard` in a bottom sheet

**Checkpoint**: User Story 3 complete — dependents management and digital ID cards fully functional

---

## Phase 6: User Story 4 — Omnichannel Communication Inbox (Priority: P4)

**Goal**: Members see segmented broker notices and district alerts with per-segment unread counts.

**Independent Test**: Send one `BROKER_NOTICE` and one `DISTRICT_ALERT` message to the seeded member's tenant. Log in and open Inbox. Confirm each message appears only in its correct segment. Confirm unread badge counts update immediately after reading a message.

### Back-End — Communications Module

- [X] T054 [P] [US4] Create `api/src/modules/communications/dto/message.dto.ts` — `MessageDto` (id, subject, body, channel, readAt, sentAt, senderName), `MessageQueryDto` (`@IsOptional() @IsEnum(MessageChannel) channel`, `@IsOptional() page`), `UnreadCountsDto` (brokerUnread: number, districtUnread: number)
- [X] T055 [US4] Create `api/src/modules/communications/communications.service.ts` — `listMessages(memberId, tenantId, query)`: return paginated messages filtered by tenantId + memberId's districtId; if `channel` filter provided, apply it; `findOneAndMarkRead(messageId, memberId, tenantId)`: fetch + set `readAt = now()` if not already set; `markRead(messageId, memberId, tenantId)`: explicit mark-read; `getUnreadCounts(memberId, tenantId)`: two counts — `BROKER_NOTICE` unread + `DISTRICT_ALERT` unread
- [X] T056 [US4] Create `api/src/modules/communications/communications.controller.ts` — `@Controller('communications')` `@UseGuards(JwtAuthGuard)`: `GET /communications/messages`, `GET /communications/messages/:id`, `PATCH /communications/messages/:id/read`, `GET /communications/unread-counts`
- [X] T057 [US4] Create `api/src/modules/communications/communications.module.ts` importing `PrismaModule`

### Mobile — US4

- [X] T058 [P] [US4] Create `mobile/src/api/communicationsApi.ts` — RTK Query: `getMessages(channel?, page?)`, `getMessage(id)`, `markMessageRead(id)`, `getUnreadCounts()` endpoints; `getUnreadCounts` polled every 60s; invalidate `['Messages']` on `markMessageRead`
- [X] T059 [P] [US4] Create `mobile/src/components/UnreadBadge.tsx` — RNP `<Badge>` showing numeric count; accepts `count: number` prop; renders nothing when `count === 0`; used on Inbox tab in `_layout.tsx`
- [X] T060 [US4] Create `mobile/app/(app)/inbox.tsx` — RNP `<SegmentedButtons>` to switch between "Broker Notices" and "District Updates"; `<List.Item>` per message with `UnreadBadge` if `!readAt`; on item press navigate to message detail (mark read, display full body); update `_layout.tsx` Inbox tab badge with `getUnreadCounts` result

**Checkpoint**: User Story 4 complete — segmented inbox with unread counts fully functional

---

## Phase 7: User Story 5 — Provider Marketplace & Targeted Wellness Offers (Priority: P5)

**Goal**: Authenticated members browse tier-eligible marketplace offers and can express interest in an add-on.

**Independent Test**: Authenticate as Gold-tier member. Confirm only Gold-eligible offers are displayed (no Silver-only items). Tap an offer — verify pricing and coverage summary. Press "Express Interest" twice — confirm the action is idempotent (second press does not create a duplicate `MarketplaceInterest` record).

### Back-End — Marketplace Module

- [X] T061 [P] [US5] Create `api/src/modules/marketplace/dto/offer.dto.ts` (OfferDto: id, title, description, category, eligibleTiers, price, imageUrl) and `api/src/modules/marketplace/dto/express-interest.dto.ts` (no body — interest identified by `offerId` path param + JWT `memberId`); create `OfferQueryDto` (`@IsOptional() category: OfferCategory`, `@IsOptional() page`)
- [X] T062 [US5] Create `api/src/modules/marketplace/marketplace.service.ts` — `listOffers(memberId, tenantId, query)`: find member's active plan tier, filter `MarketplaceOffer` where `tenantId` matches and offer's `eligibleTiers` includes member's tier; `findOffer(offerId, tenantId)`: fetch single offer with tenantId guard; `expressInterest(offerId, memberId, tenantId)`: upsert `MarketplaceInterest` on `[offerId, enrollmentId]` unique constraint (idempotent per research decision)
- [X] T063 [US5] Create `api/src/modules/marketplace/marketplace.controller.ts` — `@Controller('marketplace')` `@UseGuards(JwtAuthGuard)`: `GET /marketplace/offers`, `GET /marketplace/offers/:id`, `POST /marketplace/offers/:id/interest`
- [X] T064 [US5] Create `api/src/modules/marketplace/marketplace.module.ts` importing `PrismaModule`

### Mobile — US5

- [X] T065 [P] [US5] Create `mobile/src/api/marketplaceApi.ts` — RTK Query: `getOffers(category?, page?)`, `getOffer(id)`, `expressInterest(offerId)` endpoints; invalidate `['Offers']` after expressInterest
- [X] T066 [US5] Create `mobile/app/(app)/marketplace.tsx` — RNP `<FlatList>` of offer cards (each with `<Card.Cover>`, title, price, `PlanTierChip` showing tier eligibility); filter chips for `OfferCategory`; on card press show detail bottom sheet with "Express Interest" `<Button>`; success `<Snackbar>` on interest submitted

**Checkpoint**: User Story 5 complete — tier-filtered marketplace with idempotent interest submission functional

---

## Phase 8: User Story 6 — Health Events Calendar & RSVP (Priority: P6)

**Goal**: Members view tenant-scoped health events and can RSVP; waitlist logic applies when capacity is reached.

**Independent Test**: Create a health event for tenant `demo-health` with capacity 1. Authenticate as two different members of that tenant. First member RSVPs — confirm status `ATTENDING`. Second member RSVPs — confirm status `WAITLISTED`. First member cancels RSVP — confirm second member can now RSVP as `ATTENDING`. Confirm event meeting URL is only returned when status is `ATTENDING`.

### Back-End — Events Module

- [X] T067 [P] [US6] Create `api/src/modules/events/dto/health-event.dto.ts` (EventDto: id, title, description, eventDate, location, category, capacity, rsvpCount, myRsvpStatus?) and `api/src/modules/events/dto/rsvp.dto.ts` (RsvpResponseDto: status ATTENDING|WAITLISTED, eventId, memberId; `EventQueryDto`: `@IsOptional() @IsBoolean() myRsvpOnly`)
- [X] T068 [US6] Create `api/src/modules/events/events.service.ts` — `listEvents(memberId, tenantId, query)`: tenant-scoped events, optionally filter `myRsvpOnly` by checking `EventRsvp` exists; `findOne(eventId, memberId, tenantId)`: return event detail, include `meetingUrl` ONLY if member's RSVP status is `ATTENDING`; `createRsvp(eventId, memberId, tenantId)`: if `rsvpCount < capacity` set `ATTENDING`, else set `WAITLISTED`; `cancelRsvp(eventId, memberId, tenantId)`: soft-cancel (set `cancelledAt = now()`), if waitlisted member exists promote first to `ATTENDING`
- [X] T069 [US6] Create `api/src/modules/events/events.controller.ts` — `@Controller('events')` `@UseGuards(JwtAuthGuard)`: `GET /events`, `GET /events/:id`, `POST /events/:id/rsvp`, `DELETE /events/:id/rsvp`
- [X] T070 [US6] Create `api/src/modules/events/events.module.ts` importing `PrismaModule`

### Mobile — US6

- [X] T071 [P] [US6] Create `mobile/src/api/eventsApi.ts` — RTK Query: `getEvents(myRsvpOnly?)`, `getEvent(id)`, `createRsvp(eventId)`, `cancelRsvp(eventId)` endpoints; invalidate `['Events']` after RSVP mutations
- [X] T072 [US6] Create `mobile/app/(app)/events.tsx` — RNP `<FlatList>` of event cards with date, title, location, and RSVP status chip; toggle filter "My Events" using `myRsvpOnly`; on card press show detail sheet with conditional meeting link (shown only when status `ATTENDING`); RSVP/Cancel button with `ATTENDING`/`WAITLISTED` status feedback

**Checkpoint**: User Story 6 complete — events calendar, RSVP, waitlist, and conditional meeting URL all functional

---

## Phase 9: User Story 7 — Care Finder & PCP Selection (Priority: P7)

**Goal**: Members search in-network providers by location/specialty, see network badges, and submit PCP change requests.

**Independent Test**: Seed 3 providers — 2 in-network for Gold tier (accepting new patients), 1 not in Gold network. Authenticate as Gold-tier member. Search by location with 50-mile radius. Confirm only the 2 in-network providers show "In Network" badge. Filter by `acceptingNewPatients=true`. Select one as PCP — confirm a `PcpChangeRequest` record is created and a confirmation is returned. Confirm the 3rd provider shows "Out of Network" badge.

### Back-End — Care Module

- [X] T073 [P] [US7] Create `api/src/modules/care/dto/provider-search.dto.ts` (ProviderSearchDto: `@IsOptional() @IsLatitude() lat`, `@IsOptional() @IsLongitude() lng`, `@IsOptional() @IsNumber() radiusMiles = 25`, `@IsOptional() specialty`, `@IsOptional() @IsBoolean() acceptingNewPatients`) and `api/src/modules/care/dto/pcp-change.dto.ts` (PcpChangeDto: `@IsUUID() providerId`)
- [X] T074 [US7] Create `api/src/modules/care/care.service.ts` — `searchProviders(memberId, tenantId, query)`: fetch providers where `tenantId` matches; if `lat`/`lng` provided compute Haversine distance in-process and filter to `radiusMiles`; attach `distanceMiles` to response; filter `networkTiers` JSON column includes member's active plan tier; apply `specialty` and `acceptingNewPatients` filters; `findProvider(providerId, tenantId)`: single provider with tenantId guard; `submitPcpChange(memberId, tenantId, dto)`: validate provider is in-network for member's tier, upsert PCP change request
- [X] T075 [US7] Create `api/src/modules/care/care.controller.ts` — `@Controller('care')` `@UseGuards(JwtAuthGuard)`: `GET /care/providers`, `GET /care/providers/:id`, `POST /care/pcp-selection`
- [X] T076 [US7] Create `api/src/modules/care/care.module.ts` importing `PrismaModule`

### Mobile — US7

- [X] T077 [P] [US7] Create `mobile/src/api/careApi.ts` — RTK Query: `searchProviders(ProviderSearchDto)`, `getProvider(id)`, `submitPcpChange(PcpChangeDto)` endpoints; cache tag `['Providers']`
- [X] T078 [P] [US7] Create `mobile/src/components/NetworkBadge.tsx` — RNP `<Chip>` with "In Network" (`success`/green token) or "Out of Network" (`error`/red token) label; accepts `inNetwork: boolean` prop; colors via `useTheme()` only
- [X] T079 [US7] Create `mobile/app/(app)/care-finder.tsx` — RNP `<Searchbar>` for location input; filter chips for specialty, acceptingNewPatients; `<FlatList>` of provider cards with `NetworkBadge` and `distanceMiles`; on card press show detail sheet with address, phone, accepting status, and "Select as PCP" `<Button>`; success `<Snackbar>` on PCP selection

**Checkpoint**: User Story 7 complete — provider search, network badges, and PCP selection all functional

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Wire all modules together, complete Swagger documentation, validate HIPAA controls, and perform end-to-end quickstart validation.

- [X] T080 Update `api/src/app.module.ts` to import all 8 feature modules in dependency-safe order: `PrismaModule`, `TenantsModule`, `AuthModule`, `MembersModule`, `PlansModule`, `DependentsModule`, `CommunicationsModule`, `MarketplaceModule`, `EventsModule`, `CareModule` — verify no circular imports (per research decision R-07)
- [X] T081 [P] Add `@ApiTags()`, `@ApiBearerAuth()`, `@ApiOperation({ summary })`, and `@ApiResponse()` decorators to all 8 controllers (`auth`, `members`, `plans`, `dependents`, `communications`, `marketplace`, `events`, `care`) for full Swagger documentation at `/api-docs`
- [X] T082 [P] Add `@ApiProperty()` decorators to all DTOs in `api/src/modules/*/dto/` so Swagger UI shows request/response schemas
- [X] T083 [P] Validate `PhiRedactionInterceptor` in `api/src/common/interceptors/phi-redaction.interceptor.ts` covers all PHI field names from `data-model.md` (`email`, `ssn`, `dateOfBirth`, `memberNumber`, `phone`, `firstName`, `lastName` when in auth logs); write a unit test confirming PHI is absent from interceptor output
- [X] T084 [P] Audit all 8 service files — confirm every Prisma query includes `where: { tenantId }` (or `where: { member: { tenantId } }` for nested queries) per constitution Principle V; fix any missing tenantId guards
- [X] T085 [P] Update `mobile/app/(app)/_layout.tsx` to wire live `getUnreadCounts` result from `communicationsApi` into the Inbox tab `UnreadBadge`, replacing the placeholder from T022
- [X] T086 Create `api/prisma/seed.ts` — insert demo `Tenant` (slug: `demo-health`, name: "Demo Health Plan"), one `District`, one `Broker`, one `Member` (`jane.doe@example.com`, password `Password1!` bcrypt-hashed cost 12), one active `PlanEnrollment` (Gold tier), one `DigitalInsuranceCard`, two `CommunicationMessage` records (one `BROKER_NOTICE`, one `DISTRICT_ALERT`), three `HealthEvent` records, five `MarketplaceOffer` records, and five `Provider` records with valid lat/lng; register seed in `api/package.json` under `"prisma": { "seed": "ts-node prisma/seed.ts" }`
- [X] T087 [P] Run full quickstart.md validation: `docker compose up -d`, `npx prisma migrate dev`, `npx prisma db seed`, `curl http://localhost:3000/health`, `curl POST /auth/login` with seeded credentials — confirm 200 response with tokens
- [X] T088 [P] Run `cd mobile && npx expo start --web` and navigate all 6 screens — confirm no TypeScript errors, no RNP component warnings, and tenant branding is applied correctly
- [X] T089 [P] Run `cd api && npx tsc --noEmit` and `cd mobile && npx tsc --noEmit` — confirm zero TypeScript errors across both projects before marking implementation complete

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    └── Phase 2 (Foundational) — depends on Phase 1 complete
            ├── Phase 3 (US1) — depends on Phase 2
            │       └── Phase 4 (US2) — depends on Phase 2; may integrate with US1 home screen
            ├── Phase 4 (US2) — depends on Phase 2
            ├── Phase 5 (US3) — depends on Phase 2
            ├── Phase 6 (US4) — depends on Phase 2
            ├── Phase 7 (US5) — depends on Phase 2 + US2 (needs active enrollment tier)
            ├── Phase 8 (US6) — depends on Phase 2
            └── Phase 9 (US7) — depends on Phase 2 + US2 (needs active plan tier for network filter)
                            └── Phase 10 (Polish) — depends on all Phases 3–9
```

### User Story Dependencies

| Story | Can Start After | Integration Points |
|---|---|---|
| US1 (P1) | Phase 2 | None — independent MVP |
| US2 (P2) | Phase 2 | Updates US1 home screen; needs `PlanEnrollment` model |
| US3 (P3) | Phase 2 | Depends on `PlanEnrollment` (card generation); `PlanTierChip` from US2 reused |
| US4 (P4) | Phase 2 | None — independent; `UnreadBadge` wired to `_layout.tsx` in Polish phase |
| US5 (P5) | Phase 2 | Needs active plan tier from US2 for eligibility filtering |
| US6 (P6) | Phase 2 | None — independent |
| US7 (P7) | Phase 2 | Needs active plan tier from US2 for network tier badge |

### Within Each User Story

```
DTOs (parallelizable) → Services (depends on DTOs) → Controllers (depends on services) → Module
Mobile API (parallelizable) → Mobile hooks (depends on API) → Screens (depends on hooks + components)
```

### Parallel Opportunities

- **Phase 1**: T001 ∥ T002; T003 ∥ T004 ∥ T005 ∥ T006 ∥ T007 (after T001/T002)
- **Phase 2**: T010 → T011 ∥ T012; T013 → T014 ∥ T015 ∥ T016; T017 → T018 ∥ T019 ∥ T020; T021 → T022
- **Phase 3+**: Back-end DTOs for all parallel stories can run simultaneously; mobile API files and screen files can run in parallel within a story
- **Phase 10**: T081 ∥ T082 ∥ T083 ∥ T084 ∥ T085 ∥ T088 ∥ T089

---

## Parallel Execution Examples

### Phase 2 — Foundational
```bash
# After T010 (PrismaService):
Parallel track A: T011 (app.module.ts), T012 (main.ts)
Parallel track B: T013 (jwt.strategy) → T014 (guard), T015 (decorator), T016 (interceptor)
Parallel track C: T017 (mobile _layout) → T018 (theme), T019 (authStore), T020 (tenantStore)
```

### Phase 3 — US1 (after Foundational complete)
```bash
# Back-end DTOs (all parallel):
T023 (auth DTOs) ∥ T024 (tenant DTOs) ∥ T025 (member DTOs)

# Services (after DTOs):
T026 (TenantsService) ∥ T031 (MembersService, stub)

# Mobile (after T021 apiClient):
T034 (authApi) ∥ T035 (useAuth) ∥ T036 (useTenantConfig)
```

### Phases 5–9 — User Stories in Parallel (with 3+ developers)
```bash
Developer A: Phase 5 (US3 — Dependents)
Developer B: Phase 6 (US4 — Communications)
Developer C: Phase 7 (US5 — Marketplace)
# Then rotate to Phase 8 (US6) and Phase 9 (US7)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (**CRITICAL** — blocks all stories)
3. Complete Phase 3: User Story 1 (T023–T038)
4. **STOP and VALIDATE**: Log in with seeded credentials, confirm tenant isolation between two accounts
5. **Deploy/Demo**: The authenticated, tenant-scoped portal is the MVP deliverable

### Incremental Delivery

| Sprint | Deliverable | Tasks |
|---|---|---|
| Sprint 1 | Setup + Foundation | T001–T022 |
| Sprint 2 | MVP: Auth + Tenant Identity | T023–T038 |
| Sprint 3 | Plan Overview + Dependents | T039–T053 |
| Sprint 4 | Inbox + Marketplace | T054–T066 |
| Sprint 5 | Events + Care Finder | T067–T079 |
| Sprint 6 | Polish + Validation | T080–T089 |

### Task Totals

| Phase | Story | Tasks | Back-End | Mobile |
|---|---|---|---|---|
| Phase 1 | Setup | 9 | 7 | 2 |
| Phase 2 | Foundational | 13 | 7 | 6 |
| Phase 3 | US1 (P1) | 16 | 8 | 5 (T034-T038) |
| Phase 4 | US2 (P2) | 8 | 4 | 4 |
| Phase 5 | US3 (P3) | 7 | 4 | 3 |
| Phase 6 | US4 (P4) | 7 | 4 | 3 |
| Phase 7 | US5 (P5) | 6 | 4 | 2 |
| Phase 8 | US6 (P6) | 6 | 4 | 2 |
| Phase 9 | US7 (P7) | 7 | 4 | 3 |
| Phase 10 | Polish | 10 | 5 | 5 |
| **Total** | | **89** | **55** | **35** |

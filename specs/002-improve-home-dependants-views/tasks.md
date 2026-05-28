# Tasks: Improve Home & Dependants Views

**Input**: Design documents from `specs/002-improve-home-dependants-views/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/plan-summary.md ✅, contracts/dependants.md ✅, quickstart.md ✅

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story. US1 and US3 (both P1) can be worked in parallel after Phase 2 completes.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1/2/3/4]**: Which user story this task belongs to
- All file paths are relative to the monorepo root

---

## Phase 1: Setup

**Purpose**: Apply the Prisma schema changes and update seed data. These steps must complete before any API or mobile work begins.

- [X] T001 Add `planType String @default("MEDICAL") @db.NVarChar(20)`, `deductibleLimit Decimal? @db.Decimal(10,2)`, `deductibleMet Decimal? @default(0) @db.Decimal(10,2)`, and `@@index([tenantId, planType])` to the `PlanEnrollment` model in `api/prisma/schema.prisma`
- [X] T002 Run Prisma migration to apply the three new `PlanEnrollment` columns: `pnpm --filter api prisma migrate dev --name add_plan_type_deductible`
- [X] T003 Update `PlanEnrollment` seed records in `api/prisma/seed.ts` to set `planType` (`MEDICAL`, `DENTAL`, etc.), `deductibleLimit` (e.g. `1500.00` for medical, `null` for dental), and `deductibleMet` (e.g. `425.00`) on each enrollment seed entry

**Checkpoint**: `pnpm --filter api prisma studio` shows the three new columns on `PlanEnrollment`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Response DTOs (API) and TypeScript interfaces (mobile) that every user story task depends on. All four tasks in this phase can run in parallel.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 [P] Create `PlanSummaryResponseDto` class with `@Exclude()` at class level, `@Expose()` on all response fields, and `@Transform(({ value }) => Number(value))` on `monthlyPremium`, `deductibleLimit`, `deductibleMet` in `api/src/modules/members/dto/plan-summary.dto.ts`
- [X] T005 [P] Create `DependantCardDto` and `DependantSummaryResponseDto` classes with `@Exclude()` at class level and `@Expose()` on each response field in `api/src/modules/members/dto/dependant-list.dto.ts`
- [X] T006 [P] Create `PlanSummary` TypeScript interface matching the `/members/me/plan-summary` response shape (id, planName, planType, planTier, groupNumber, effectiveDate, terminationDate, nextRenewalDate, status, monthlyPremium, deductibleLimit, deductibleMet, memberIdNumber, firstName, lastName) in `mobile/src/types/planSummary.ts`
- [X] T007 [P] Create `DependantCard` and `Dependant` TypeScript interfaces matching the `/members/me/dependants` response shape (id, firstName, lastName, relationship, dateOfBirth, isActive, coverageStatus, digitalCard: DependantCard | null) in `mobile/src/types/dependant.ts`

**Checkpoint**: Foundation ready — TypeScript compiles in both `api/` and `mobile/` with no errors. User story implementation can begin.

---

## Phase 3: User Story 1 — View My Plan Summary on Home Screen (Priority: P1) 🎯 MVP

**Goal**: The authenticated member opens the Home tab and sees a card per active enrollment with name, plan details, status badge, and monthly premium.

**Independent Test**: Run `curl http://localhost:3000/members/me/plan-summary -H "Authorization: Bearer <token>"` and confirm a JSON array with at least one entry including `planName`, `planType`, `groupNumber`, `status`, `monthlyPremium`. Open Home tab in Expo — plan card(s) render without crashing.

### Implementation for User Story 1

- [X] T008 [US1] Implement `getPlanSummary(memberId: string, tenantId: string): Promise<PlanSummaryResponseDto[]>` in `api/src/modules/members/members.service.ts` — `prisma.planEnrollment.findMany({ where: { tenantId, memberId, status: { in: ['ACTIVE', 'PENDING'] } }, select: { id, planName, planType, planTier, groupNumber, effectiveDate, terminationDate, nextRenewalDate, status, premiumAmount, deductibleLimit, deductibleMet, member: { select: { firstName, lastName, memberIdNumber } } }, orderBy: [{ planType: 'asc' }, { effectiveDate: 'desc' }] })` — map `premiumAmount` → `monthlyPremium` and flatten `member.*` fields into the response DTO
- [X] T009 [US1] Add `@Get('me/plan-summary') @ApiOperation({ summary: 'Get member plan summary' }) getPlanSummary(@CurrentUser() user: JwtPayload): Promise<PlanSummaryResponseDto[]>` handler to `api/src/modules/members/members.controller.ts`
- [X] T010 [P] [US1] Add `getPlanSummary: () => apiClient.get('/members/me/plan-summary').then((r) => r.data as PlanSummary[])` to the `plansApi` object in `mobile/src/api/plansApi.ts`
- [X] T011 [US1] Rewrite `usePlanOverview` hook in `mobile/src/hooks/usePlanOverview.ts` to call `plansApi.getPlanSummary()`, return `{ planSummaries: PlanSummary[], isLoading, error }`, and compute `isRenewalPending: boolean` (true if any enrollment's `nextRenewalDate` is within 30 days of today)
- [X] T012 [US1] Update `mobile/app/(app)/home.tsx` to map `planSummaries` to a `PlanSummaryCard` per enrollment — render a `<Card>` per entry showing: member `firstName + lastName`, `memberIdNumber`, `planName`, a `<Chip>` for `planType` (MEDICAL/DENTAL/VISION/LIFE), `groupNumber`, formatted `effectiveDate`, formatted `nextRenewalDate` or `terminationDate`, and a `<Chip>` for `status` (colour from `useTheme()` — no hardcoded hex)

**Checkpoint**: Home screen shows one plan card per active enrollment with correct data. `GET /members/me/plan-summary` returns HTTP 200 with correct array.

---

## Phase 4: User Story 3 — View Dependants List (Priority: P1)

**Goal**: Member opens the Dependants tab and sees all active dependants with name, relationship, calculated age, and coverage status badge.

**Independent Test**: Run `curl http://localhost:3000/members/me/dependants -H "Authorization: Bearer <token>"` and confirm a JSON array with firstName, lastName, relationship, dateOfBirth, coverageStatus. Open Dependants tab in Expo — list renders with age computed from `dateOfBirth` (not raw date string).

### Implementation for User Story 3

- [X] T013 [US3] Implement `getDependants(memberId: string, tenantId: string): Promise<DependantSummaryResponseDto[]>` in `api/src/modules/members/members.service.ts` — `prisma.dependent.findMany({ where: { tenantId, memberId, isActive: true }, select: { id, firstName, lastName, relationship, dateOfBirth, isActive, memberIdNumber, digitalCards: { select: { cardholderName, memberIdNumber, groupNumber, planName, effectiveDate, terminationDate, enrollment: { select: { status: true } } }, take: 1, orderBy: { effectiveDate: 'desc' } } }, orderBy: [{ relationship: 'asc' }, { firstName: 'asc' }] })` — derive `coverageStatus` from `digitalCards[0]?.enrollment?.status ?? 'UNKNOWN'`, map `digitalCards[0]` → `digitalCard: DependantCardDto | null`
- [X] T014 [US3] Add `@Get('me/dependants') @ApiOperation({ summary: 'Get member dependants list' }) getDependants(@CurrentUser() user: JwtPayload): Promise<DependantSummaryResponseDto[]>` handler to `api/src/modules/members/members.controller.ts`
- [X] T015 [P] [US3] Update `mobile/src/api/dependentsApi.ts` — add `getDependants: () => apiClient.get('/members/me/dependants').then((r) => r.data as Dependant[])` function (keep existing CRUD functions, only add the new summary call)
- [X] T016 [US3] Create `useDependants` hook in `mobile/src/hooks/useDependants.ts` that calls `dependentsApi.getDependants()` and returns `{ dependants: Dependant[], isLoading, error }` — export `computeAge(dob: string): number` helper using `Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000))`
- [X] T017 [US3] Rewrite `mobile/app/(app)/dependents.tsx` dependant list to use `useDependants` hook — render each dependant with `<List.Item>` showing full name as title, relationship label + `"Age " + computeAge(dob)` as description (never render raw `dateOfBirth` string), and a `<Chip>` for `coverageStatus` as right accessory; show `<Text>"No dependants on record"</Text>` empty state when list is empty

**Checkpoint**: Dependants screen shows all active dependants with correct age (not raw DOB) and status badge. `GET /members/me/dependants` returns HTTP 200.

---

## Phase 5: User Story 2 — Track Deductible Progress (Priority: P2)

**Goal**: The plan card on the Home screen shows a deductible progress bar when the enrollment has a non-null, non-zero `deductibleLimit`; the row is hidden for plans without a deductible.

**Independent Test**: Seed one MEDICAL enrollment with `deductibleLimit: 1500, deductibleMet: 425` and one DENTAL enrollment with `deductibleLimit: null`. Open Home tab — MEDICAL card shows `ProgressBar` at ~28% with label "$425 met of $1,500"; DENTAL card has no deductible row.

### Implementation for User Story 2

- [X] T018 [US2] Extend `usePlanOverview` hook in `mobile/src/hooks/usePlanOverview.ts` to compute per-enrollment `showDeductible: boolean` (`deductibleLimit !== null && deductibleLimit > 0`) and `deductibleProgress: number` (`Math.min(1, Math.max(0, (deductibleMet ?? 0) / deductibleLimit))`) — expose these alongside each `PlanSummary` item
- [X] T019 [US2] Update plan card in `mobile/app/(app)/home.tsx` to render `<ProgressBar progress={deductibleProgress} />` and `<Text>"${deductibleMet} met of ${deductibleLimit}"</Text>` only when `showDeductible` is true, and render the renewal `<Banner>` at the top of the screen when `isRenewalPending` is true

**Checkpoint**: Deductible row appears on MEDICAL card, is absent on DENTAL card. Renewal Banner fires when `nextRenewalDate` is within 30 days.

---

## Phase 6: User Story 4 — View Dependant Digital ID Card (Priority: P2)

**Goal**: Tapping a dependant in the Dependants screen opens an ID card view showing the card details, or a "not yet issued" message if no card is on file.

**Independent Test**: Seed one dependant with a `DigitalInsuranceCard` row and one without. Tap the first — ID card shows `cardholderName`, `memberIdNumber`, `groupNumber`, `planName`, `effectiveDate`. Tap the second — "Card not yet issued — contact your plan administrator" is displayed.

### Implementation for User Story 4

- [X] T020 [US4] Update `mobile/app/(app)/dependents.tsx` — add `onPress` to each `<List.Item>` that sets a `selectedDependant` state, and render a `<Modal>` (react-native-paper) containing either a `<Card>` with cardholder name, member ID, group number, plan name, and formatted effective date from `selectedDependant.digitalCard`, or a `<Text>"Card not yet issued — contact your plan administrator"</Text>` when `digitalCard` is null

**Checkpoint**: Tapping a dependant with a card shows the full card view in a modal. Tapping one without a card shows the "not yet issued" message.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Empty states, error handling, and final integration verification.

- [X] T021 [P] Add `{planSummaries.length === 0 && <Surface><Text>No active coverage</Text></Surface>}` empty state to `mobile/app/(app)/home.tsx` when `usePlanOverview` returns an empty array and `isLoading` is false
- [X] T022 [P] Add `<ActivityIndicator>` loading state and an error `<Text>` with a retry `<Button>` to `mobile/app/(app)/home.tsx` for the `isLoading` and `error` states from `usePlanOverview`
- [X] T023 [P] Add `<ActivityIndicator>` loading state and an error `<Text>` with a retry `<Button>` to `mobile/app/(app)/dependents.tsx` for the `isLoading` and `error` states from `useDependants`
- [ ] T024 Verify the full quickstart.md checklist: confirm migration applied, seed data loaded (`pnpm --filter api prisma db seed`), `GET /members/me/plan-summary` returns 200 with correct shape, `GET /members/me/dependants` returns 200 with correct shape, Home and Dependants screens render correctly in Expo

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately. T001 → T002 → T003 (sequential; migration requires schema file to exist)
- **Phase 2 (Foundational)**: Requires Phase 1 complete (schema compiled). T004–T007 all in parallel.
- **Phase 3 (US1)** and **Phase 4 (US3)**: Both require Phase 2 complete. Can run **in parallel** — they touch different files within each phase.
- **Phase 5 (US2)**: Requires Phase 3 complete (extends `usePlanOverview` and `home.tsx`).
- **Phase 6 (US4)**: Requires Phase 4 complete (extends `dependents.tsx`).
- **Phase 7 (Polish)**: Requires Phases 5 and 6 complete.

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|---|---|---|
| US1 (Phase 3) | Phase 2 complete | US3 (Phase 4) |
| US3 (Phase 4) | Phase 2 complete | US1 (Phase 3) |
| US2 (Phase 5) | US1 (Phase 3) complete | — |
| US4 (Phase 6) | US3 (Phase 4) complete | Phase 5 (US2) |

### Within Each User Story

- Back-end tasks (service → controller) are sequential
- Mobile API call (`[P]`) can be written in parallel with the back-end
- Mobile hook always depends on the mobile API function
- Mobile screen always depends on the mobile hook

---

## Parallel Execution Example: User Stories 1 and 3 in Parallel

```
Phase 2 complete ──┬── [US1] T008 getPlanSummary service
                   │         ↓
                   │   [US1] T009 getPlanSummary controller
                   │         ↓                              ─── [US1] T010 [P] plansApi.getPlanSummary
                   │   [US1] T011 usePlanOverview refactor ◄───────────────────────────────────────────
                   │         ↓
                   │   [US1] T012 home.tsx plan cards
                   │
                   └── [US3] T013 getDependants service
                             ↓
                       [US3] T014 getDependants controller
                             ↓                              ─── [US3] T015 [P] dependentsApi.getDependants
                       [US3] T016 useDependants hook ◄──────────────────────────────────────────────────
                             ↓
                       [US3] T017 dependents.tsx list
```

---

## Implementation Strategy

**MVP Scope** (deliver first): Phase 1 + Phase 2 + Phase 3 (US1) = T001–T012.  
A member can see their plan summary card with name, plan details, and status. This alone is the primary value of the feature.

**Full Scope** (complete delivery): All phases T001–T024.

**Suggested increment order**:
1. T001–T003 (Setup): ~30 min — schema changes, migration, seed update
2. T004–T007 (Foundational): ~45 min — DTOs and interfaces, all in parallel
3. T008–T012 (US1): ~90 min — plan summary endpoint + home screen
4. T013–T017 (US3): ~90 min — dependants endpoint + dependants screen (parallel with US1 if team allows)
5. T018–T019 (US2): ~30 min — deductible progress bar (small addition to existing hook + screen)
6. T020 (US4): ~45 min — digital ID card modal
7. T021–T024 (Polish): ~30 min — empty states, error handling, final verification

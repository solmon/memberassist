# Research: Improve Home & Dependants Views

**Branch**: `002-improve-home-dependants-views` | **Date**: 2026-05-27

---

## Research Questions

The Technical Context for this feature had no `NEEDS CLARIFICATION` markers at specification time. Research was conducted to validate technology choices, settle the two design questions below, and confirm best practices before design artifacts are generated.

---

## Decision 1: Where to Host the Two New Endpoints

**Question**: Should `GET /members/me/plan-summary` and `GET /members/me/dependants` live in the existing `MembersController` or in separate `PlansController` / `DependentsController`?

**Decision**: Both endpoints belong in `MembersController` (i.e., `GET /members/me/plan-summary` and `GET /members/me/dependants`).

**Rationale**:
- The existing `MembersController` already owns the `/members/me` resource and handles the authenticated member's profile. Adding summary sub-resources there is the standard NestJS "sub-resource under owner" pattern.
- A separate `PlansController` already exists at `/plans`; that controller serves generic plan catalog data, not member-scoped enrollment summaries. Mixing the two would create ambiguity about tenancy scope.
- The `DependentsController` at `/dependents` handles CRUD for dependant management. `GET /members/me/dependants` is a *read-only summary* scoped to the currently authenticated member and intentionally returns a different (reduced) shape from the management endpoint. Co-locating it under `/members/me` makes the "my data" vs "manage data" distinction explicit.

**Alternatives considered**: Adding a `GET /plans/my-summary` route under `PlansController`. Rejected because it duplicates member-scoped authentication concerns already established in `MembersController`.

---

## Decision 2: `planType` Column — Enum or Free String

**Question**: Should `planType` be a database-level `enum` or a constrained `NVarChar` string?

**Decision**: `NVarChar(20)` with a TypeScript union type + `class-validator` `@IsIn([...])` guard on the DTO, not a database-level enum.

**Rationale**:
- Prisma's MSSQL provider supports enums via `CREATE TYPE`, but altering an enum in SQL Server requires dropping and recreating the type — a destructive migration step. A constrained `NVarChar` column can be extended by simply inserting new values and updating the TypeScript union; no migration needed for adding a new plan type.
- The constitution requires `NVarChar` for user-generated string columns. `planType` values come from administrative seeding, not free-form user input, but the NVarChar rule still applies.
- A TypeScript `const enum` / union (`'MEDICAL' | 'DENTAL' | 'VISION' | 'LIFE'`) enforces safety at the application layer, which is where this project's type-safety guarantees are held.

**Alternatives considered**: Prisma `enum PlanType { MEDICAL DENTAL VISION LIFE }`. Rejected due to MSSQL migration fragility when adding new plan types.

---

## Decision 3: Age Calculation — API or Mobile Client

**Question**: Should member/dependant age be calculated server-side (returned in the API response) or client-side in the mobile app?

**Decision**: Age is calculated **client-side** in the mobile app.

**Rationale**:
- Age is a purely derived, ephemeral value (today's date minus date of birth). Persisting or transmitting it adds no value and would require the server to know "today" — which varies by time zone.
- The API returns `dateOfBirth` (already on `Dependent`). The mobile app computes age locally using a shared utility function. This avoids clock-drift issues between server and client time zones.
- PHI guardrail: the API response omits full DOB (only year of birth or age is shown on screen). The mobile app receives full DOB for the age calculation, but never renders the raw DOB string. Full DOB is only used to derive the display age.

**Alternatives considered**: Server returns `age: number` directly. Rejected because the value would stale the instant a birthday passes between API call and render, and would require cache invalidation logic.

---

## Decision 4: Deductible Handling — Null vs Zero

**Question**: How should the UI behave when `deductibleLimit` is null (plan has no deductible) vs zero (deductible seeded incorrectly)?

**Decision**: Hide the deductible row entirely when `deductibleLimit` is `null`. Treat `deductibleLimit = 0` as "no deductible" and also hide the row (guard: `if (!deductibleLimit || deductibleLimit <= 0)`). Display `deductibleMet = null` as `$0` when the row is shown.

**Rationale**:
- Some plan types (e.g., certain dental or vision plans) genuinely have no deductible. A null column is the canonical representation of "not applicable."
- Displaying a $0/$0 deductible bar would be meaningless and could confuse members.
- The `usePlanOverview` hook already has a `deductiblePercent` derived value; extending it to include a `showDeductible` boolean is minimal and contained to one hook.

**Alternatives considered**: Always show the row, defaulting to `$0 / $0`. Rejected as it surfaced a confusing "0%" bar for plans with no deductible.

---

## Decision 5: Multiple Active Enrollments — Card per Enrollment

**Question**: A member may have simultaneous active enrollments (e.g., Medical + Dental). How should the Home screen handle this?

**Decision**: Render one `PlanSummaryCard` component per active enrollment, stacked vertically in a `ScrollView`. Each card is self-contained with its own plan type, premium, and deductible row.

**Rationale**:
- This mirrors how the Hear2.0 Angular portal handles multi-line enrollment: each coverage type appears as a distinct row. On mobile, a vertical card stack is the natural MD3 equivalent.
- The new `GET /members/me/plan-summary` endpoint returns an **array** of plan summaries (one per active enrollment), keeping the contract flexible for single or multi-enrollment members.
- Tabs or a carousel were evaluated and rejected: tabs add navigation overhead; a carousel hides content. A vertically scrolled stack is the simplest implementation and aligns with how the rest of the Home screen uses cards.

**Alternatives considered**: Show only the "primary" enrollment (e.g., Medical). Rejected because it would silently hide Dental/Vision coverage the member paid for.

---

## Decision 6: Dependants Screen — Active Only vs All

**Question**: Should inactive dependants be shown (greyed out) or omitted entirely?

**Decision**: Only active dependants (`isActive = true`) are returned by `GET /members/me/dependants`. Inactive dependants are **not** shown in this feature's scope.

**Rationale**:
- The spec (FR-008) says "list all active dependants." Including inactive records adds UI complexity (section headers, greyed rows) with no immediate member value.
- If a dependant has been removed from coverage, the member's broker or district administrator is the appropriate party to reinstate them. The self-service mobile app is read-oriented for this feature.

**Alternatives considered**: Show inactive dependants in a collapsible "Inactive" section. Deferred to a future feature increment.

---

## Decision 7: Digital ID Card — Dependant Without Issued Card

**Question**: What is shown when a dependant exists in the database but has no `DigitalInsuranceCard` row?

**Decision**: Display a "Card not yet issued — contact your plan administrator" message in the detail view. Do not show a blank card template.

**Rationale**: Cards are generated by a back-office process after enrollment confirmation. A gap between dependent enrollment and card issuance is a known operational scenario. The member needs actionable messaging, not an empty UI slot.

---

## Technology Confirmations (Best Practices)

| Topic | Confirmed Practice |
|---|---|
| Prisma `select` on sensitive fields | Use explicit `select: { ... }` to exclude `passwordHash`, `dateOfBirth` (full), `email` from plan-summary and dependants responses. Never use `findMany` without a `select` on models containing PHI. |
| NestJS `@UseGuards(JwtAuthGuard)` | Both new endpoints share the existing `JwtAuthGuard` + `TenantGuard` chain already in `MembersController`. No new guard needed. |
| Response DTOs with `class-transformer` | Use `@Expose()` on all response fields and `@Exclude()` at the class level (`@Exclude()` on the class + `excludeExtraneousValues: true` in the interceptor). This ensures no accidental PHI leakage if a field is added to the Prisma model later. |
| `ProgressBar` component (RNP) | `<ProgressBar progress={n}/>` where `n` is a float 0.0–1.0. Clamp the value: `Math.min(1, Math.max(0, met / limit))` to handle cases where `met > limit` (over-deductible). |
| `Chip` for status badge (RNP) | Use `<Chip icon={...}>Active</Chip>` styled via `theme.colors.primary` / `theme.colors.error` for Active / Inactive states. No hardcoded hex. |

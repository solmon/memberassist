# Feature Specification: Improve Home & Dependants Views

**Feature Branch**: `002-improve-home-dependants-views`

**Created**: 2026-05-27

**Status**: Draft

**Input**: User description: "Understand the project Hear2.0.Web and improve the home and dependants views to match the current subscription and dependants views found in the Angular app. Make it simple — don't show all the details as shown in the Hear2.0 web app. The underlying DB structure also needs changes as per what is required to be shown. The mobile application API will be standalone, and will have only those data items that are required for the app."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View My Plan Summary on Home Screen (Priority: P1)

As an enrolled member, I want to open the app and immediately see a clear, clean summary of my health plan so I know my coverage is active and what I am paying.

**Why this priority**: The home screen is the first thing a member sees after login. Knowing their plan status and premium at a glance is the primary utility of a member portal.

**Independent Test**: A logged-in member opens the Home tab. The app displays a plan summary card with plan name, group number, plan type, membership ID, coverage dates, status, and monthly premium without any additional navigation.

**Acceptance Scenarios**:

1. **Given** a member with an active enrollment, **When** they open the Home tab, **Then** they see a plan summary card showing: their full name, member ID number, plan name, plan type (Medical / Dental / Vision / Life), group number, coverage effective date, coverage end/renewal date, a status badge (Active), and monthly premium amount.
2. **Given** a member whose plan renewal is within 30 days, **When** they open the Home tab, **Then** a renewal reminder banner is displayed above the plan card.
3. **Given** a member with no active enrollment, **When** they open the Home tab, **Then** a "No active coverage" message is shown in place of the plan card.
4. **Given** an authenticated member with a terminated plan, **When** they open the Home tab, **Then** the status badge reads "Inactive" and the termination date is displayed.

---

### User Story 2 — Track Deductible Progress on Home Screen (Priority: P2)

As an enrolled member, I want to see how much of my deductible I have met so I can understand my remaining out-of-pocket costs for the plan year.

**Why this priority**: Deductible tracking is among the most requested self-service features in health plan apps and directly reduces inbound support calls.

**Independent Test**: The plan summary card on the Home tab shows a deductible progress bar with the amount met and the annual limit. This can be tested independently of the dependent and coverage-date fields.

**Acceptance Scenarios**:

1. **Given** a member with a deductible-bearing plan, **When** the Home screen loads, **Then** a deductible row shows "Deductible: $X met of $Y" with a proportional progress indicator.
2. **Given** a member who has met their full deductible, **When** the Home screen loads, **Then** the progress indicator is full and a "Deductible met" label is displayed.
3. **Given** a plan with no deductible (deductible limit is $0 or null), **When** the Home screen loads, **Then** the deductible row is hidden entirely.

---

### User Story 3 — View Dependants List (Priority: P1)

As a primary member with enrolled dependants, I want to see a clean list of all my dependants so I can confirm who is covered under my plan.

**Why this priority**: Members with families need instant confirmation that all family members appear correctly in the system.

**Independent Test**: A member with at least one dependant opens the Dependants tab and sees each dependant listed with name, relationship, age (calculated), and active coverage status. No other navigation is required.

**Acceptance Scenarios**:

1. **Given** a member with active dependants, **When** they open the Dependants tab, **Then** each dependant is listed with: full name, relationship label (Spouse / Child / Domestic Partner / Other), calculated age, and a coverage status badge (Active / Inactive).
2. **Given** a member with no dependants, **When** they open the Dependants tab, **Then** a "No dependants on record" message is displayed.
3. **Given** a dependant that has been deactivated (isActive = false), **When** the Dependants tab loads, **Then** that dependant is not shown in the active list (or is shown in a separate "Inactive" section if applicable).

---

### User Story 4 — View Dependant Digital ID Card (Priority: P2)

As a primary member, I want to tap on a dependant and view their digital insurance ID card so I can share it or have it ready at point of care.

**Why this priority**: Digital ID cards are a primary value driver of the app; ensuring each dependant's card is accessible closes the gap with the Hear2.0 web portal.

**Independent Test**: Tapping a dependant in the list opens a detail view showing the dependant's digital ID card with their member ID number, group number, plan name, and coverage dates. This can be tested end-to-end independently of the dependant list sorting or add-dependant flow.

**Acceptance Scenarios**:

1. **Given** a dependant with a digital insurance card on file, **When** the member taps on that dependant, **Then** a detail view displays the dependant's digital ID card showing: cardholder name, member ID number, group number, plan name, and coverage effective date.
2. **Given** a dependant with no digital card issued, **When** the member taps on that dependant, **Then** a "Card not yet issued" message is displayed instead of a blank card.

---

### Edge Cases

- What happens when the API is unreachable? → Show a graceful offline/error state with a retry option; do not crash.
- What if a member is enrolled in multiple plan types (e.g., Medical AND Dental)? → Display a card per active enrollment, allowing the member to see each coverage type independently.
- What if a deductible amount has not been seeded (null deductibleMet)? → Treat as $0 met and display a $0 / $X deductible row.
- What if a dependent's date of birth is missing? → Display "—" for age rather than calculating an incorrect value.

---

## Requirements *(mandatory)*

### Functional Requirements

**Home Screen — Plan Summary**

- **FR-001**: The Home screen MUST display a plan summary card for each active enrollment belonging to the authenticated member.
- **FR-002**: Each plan summary card MUST show: member full name, member ID number, plan name, plan type (Medical / Dental / Vision / Life), group number, coverage status (Active / Inactive / Terminated), effective date, and end/renewal date.
- **FR-003**: Each plan summary card MUST show the monthly premium amount.
- **FR-004**: When the member has met any portion of their annual deductible, the plan card MUST display a deductible progress indicator showing amount met and annual limit.
- **FR-005**: When the deductible limit is zero or null, the deductible row MUST be hidden.
- **FR-006**: When a plan's renewal date is within 30 calendar days, the Home screen MUST display a renewal reminder banner.
- **FR-007**: The Home screen MUST NOT display sensitive fields (SSN, Tax ID, full DOB, address, telephone numbers, or financial billing details beyond the monthly premium).

**Dependants Screen**

- **FR-008**: The Dependants screen MUST list all active dependants for the authenticated member.
- **FR-009**: Each dependant list item MUST show: full name, relationship, calculated age, and coverage status badge.
- **FR-010**: Tapping a dependant MUST open a detail view showing their digital insurance card (cardholder name, member ID, group number, plan name, effective date).
- **FR-011**: When a dependant has no digital card on file, the detail view MUST display a "Card not yet issued" message.
- **FR-012**: The Dependants screen MUST NOT display SSN, Tax ID, or full address.

**API (Standalone)**

- **FR-013**: The mobile API MUST expose a `GET /members/me/plan-summary` endpoint returning only the fields required for the Home plan card (planName, planType, planTier, groupNumber, effectiveDate, terminationDate, nextRenewalDate, status, monthlyPremium, deductibleLimit, deductibleMet, memberIdNumber, firstName, lastName).
- **FR-014**: The mobile API MUST expose a `GET /members/me/dependants` endpoint returning each dependant's id, firstName, lastName, relationship, dateOfBirth, isActive, coverageStatus, and their associated digital card summary (memberIdNumber, groupNumber, planName, effectiveDate).
- **FR-015**: Both API endpoints MUST enforce tenant-scoped data isolation; a member MUST only ever receive their own data.

**Database**

- **FR-016**: The `PlanEnrollment` database entity MUST store `planType` (e.g., MEDICAL, DENTAL, VISION, LIFE) to distinguish coverage types per enrollment row.
- **FR-017**: The `PlanEnrollment` database entity MUST store `deductibleLimit` (annual deductible ceiling) and `deductibleMet` (year-to-date amount applied) to support the deductible progress indicator.
- **FR-018**: Existing fields on `Dependent` (firstName, lastName, dateOfBirth, relationship, memberIdNumber, isActive) are sufficient; no additional dependent fields are required for this feature.

### Key Entities

- **Member**: The primary authenticated user. Key display attributes: firstName, lastName, memberIdNumber, tenantId.
- **PlanEnrollment**: Represents one active coverage line for a member. Key display attributes: planName, planType, planTier, groupNumber, effectiveDate, terminationDate / nextRenewalDate, status, premiumAmount (monthly), deductibleLimit, deductibleMet.
- **Dependent**: A non-primary family member covered under the member's plan. Key display attributes: firstName, lastName, dateOfBirth (for age), relationship, isActive.
- **DigitalInsuranceCard**: The insurance card record linked to an enrollment and optionally to a dependant. Key display attributes: cardholderName, memberIdNumber, groupNumber, planName, effectiveDate.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A member can open the Home tab and read their active plan name, group number, and monthly premium in under 3 seconds on a standard 4G connection.
- **SC-002**: A member can navigate from the Dependants tab to a dependant's digital ID card in no more than 2 taps.
- **SC-003**: The Home and Dependants API endpoints each return data in under 500 ms at the 95th percentile under normal load.
- **SC-004**: 100% of plan summary responses are tenant-scoped; cross-tenant data leakage is zero.
- **SC-005**: Members report the plan summary as "easy to understand" in at least 80% of usability test sessions (target: 5 testers, 4 pass).
- **SC-006**: No PHI (SSN, Tax ID, address, full DOB) appears anywhere on the Home or Dependants screens.

---

## Assumptions

- Members are authenticated before reaching the Home or Dependants screens; the API uses a JWT bearer token to identify the member.
- A member may have more than one active `PlanEnrollment` row (e.g., separate Medical and Dental rows); all active rows are shown as individual cards on the Home screen.
- Deductible values (deductibleLimit, deductibleMet) are updated by a back-office process or seed data; real-time claims adjudication integration is out of scope for this feature.
- Gender is not required for the simplified mobile views and is intentionally omitted to reduce data exposure.
- The `planType` field will use a constrained set of string values: `MEDICAL`, `DENTAL`, `VISION`, `LIFE`. Additional types can be added without a schema migration via the string column.
- Only active dependants (isActive = true) are shown in the Dependants list by default; inactive dependants are out of scope for this feature.
- The mobile API (`api/`) is the sole backend for the mobile app; it does not share endpoints or authentication tokens with the Hear2.0 web platform.
- The existing `DigitalInsuranceCard` model's link to `PlanEnrollment` (via `enrollmentId`) and optionally to `Dependent` (via `dependentId`) is the correct pattern for resolving a dependant's card.

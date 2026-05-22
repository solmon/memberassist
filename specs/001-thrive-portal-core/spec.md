# Feature Specification: Thrive Portal — Core Member Application

**Feature Branch**: `001-thrive-portal-core`

**Created**: 2026-05-22

**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Tenant-Scoped Member Sign-In & Identity (Priority: P1)

A member opens the Thrive Portal application for the first time or after a session expiry. They
are prompted to authenticate. On successful login, the application resolves the member's
Tenant/District ID and applies the correct branding, plan configuration, and communication
preferences for that tenant. The member sees a personalised home screen reflecting their
specific employer or geographic district.

**Why this priority**: Every other feature in the portal depends on an authenticated, tenant-
scoped session. Without this story no downstream work can run. It also gates HIPAA compliance
because tenant isolation prevents cross-member or cross-district data exposure.

**Independent Test**: Can be fully tested by logging in with credentials from two different
tenants and confirming that branding, plan name, and district notifications are distinct and
isolated between sessions.

**Acceptance Scenarios**:

1. **Given** a member has valid credentials, **When** they submit the login form, **Then** they
   are authenticated, their Tenant ID is resolved, tenant-specific branding is applied, and
   they land on their home screen.
2. **Given** a member belongs to Tenant A, **When** they are authenticated, **Then** they see
   only Tenant A's plan configuration and communications — no data from Tenant B is accessible.
3. **Given** a member's session has expired, **When** they re-open the application, **Then**
   they are redirected to the login screen and no cached PHI is visible before re-authentication.
4. **Given** a member enters incorrect credentials three times, **When** the third failure
   occurs, **Then** the account is temporarily locked and a recovery path is clearly presented.
5. **Given** a member has multi-factor authentication enabled, **When** they complete the
   primary credential step, **Then** they are prompted for a second factor before session
   creation.

---

### User Story 2 — Subscription & Plan Overview (Priority: P2)

An authenticated member navigates to their coverage summary. They can view their active plan
tier (Gold, Silver, HDHP, etc.), monthly premium cost, coverage effective and expiry dates,
current deductible progress versus annual limit, and a chronological payment history. The
member immediately understands their financial exposure and coverage status without contacting
their broker.

**Why this priority**: Coverage status is the most frequently accessed section in member
portals. It directly reduces inbound broker and support queries and establishes the data
foundation for the Provider Marketplace targeting logic.

**Independent Test**: Can be fully tested by authenticating as a member and confirming the
plan tier, premium, effective date, deductible tracker, and at least one historical payment
record are all accurately displayed.

**Acceptance Scenarios**:

1. **Given** an authenticated member, **When** they open the Plan Overview screen, **Then**
   they see their active plan tier name, monthly premium, and coverage effective/expiry dates.
2. **Given** a member has a deductible-bearing plan, **When** they view their plan details,
   **Then** a deductible progress indicator shows the amount met versus the annual limit.
3. **Given** a member has made at least one premium payment, **When** they access payment
   history, **Then** all past payments are listed chronologically with date, amount, and status.
4. **Given** a member's coverage is within 30 days of expiry, **When** they view their
   subscription, **Then** a prominent renewal reminder is displayed.

---

### User Story 3 — Dependents & Digital ID Cards (Priority: P3)

An authenticated member manages coverage for family members (spouse, children, or other
qualifying dependents). They can add a new dependent, view existing dependents' coverage
status and plan tier, and generate or access a digital insurance card for each covered
individual. The digital card displays all information required for a healthcare provider to
verify coverage.

**Why this priority**: Family plan holders represent a large share of the member base.
Dependents management is a key differentiator versus paper-based broker communications
and reduces call volume to member services.

**Independent Test**: Can be fully tested by adding a new dependent, verifying the dependent
appears with correct coverage, and viewing the dependent's digital insurance card displaying
accurate plan, member ID, and group number.

**Acceptance Scenarios**:

1. **Given** an authenticated member, **When** they navigate to Dependents, **Then** all
   covered dependents are listed with name, relationship, and current coverage status.
2. **Given** a member adds a new dependent with all required fields, **When** the submission
   is confirmed, **Then** the dependent appears in the list and a digital card is generated.
3. **Given** a dependent is listed, **When** the member taps their digital card, **Then** a
   full-screen card displays member name, member ID, group number, plan tier, and effective
   date in a printable/shareable format.
4. **Given** a member tries to add a dependent exceeding the plan's maximum, **When** they
   submit, **Then** they receive a clear explanation of the limit and options for plan upgrade.

---

### User Story 4 — Omnichannel Communication Inbox (Priority: P4)

An authenticated member views an inbox that cleanly separates two streams of communication:
(1) official policy notices from their broker (renewals, plan changes, open enrollment), and
(2) localised alerts from their Tenant/District (office closures, virtual health days, local
health campaigns). Unread message counts are visible per segment. Members can read, archive,
and navigate between the two streams without confusion.

**Why this priority**: Commingled notifications cause members to miss critical policy actions
(such as open enrollment deadlines). Segmented communications improve compliance and reduce
broker escalations.

**Independent Test**: Can be fully tested by sending one broker notice and one district alert,
then confirming both appear in their correct inbox segments with accurate unread badge counts.

**Acceptance Scenarios**:

1. **Given** an authenticated member, **When** they open the Inbox, **Then** two labelled
   segments are visible: "Broker Notices" and "District Updates".
2. **Given** unread messages exist in both segments, **When** the member views the inbox,
   **Then** each segment displays a badge with its unread count.
3. **Given** a broker sends an open enrollment notice, **When** it is delivered, **Then** it
   appears only in the "Broker Notices" segment, not in "District Updates".
4. **Given** a member reads a message, **When** they navigate away and return, **Then** the
   message is marked as read and the unread count decreases accordingly.
5. **Given** a district sends a closure alert, **When** the member receives it, **Then** it
   appears only in the "District Updates" segment and is scoped to that member's tenant.

---

### User Story 5 — Provider Marketplace & Targeted Wellness Offers (Priority: P5)

An authenticated member browses a marketplace of supplemental health products and wellness
events curated based on their active plan tier and tenant eligibility rules. Displayed offers
include dental top-ups, vision plans, and wellness programmes. Each offer is visually
distinguished by relevance to the member's current coverage. Members can view offer details
and express interest in a plan add-on.

**Why this priority**: The marketplace creates a monetisation and engagement layer for brokers
and tenants. It surfaces relevant products to members at the moment they are engaged with
their health plan.

**Independent Test**: Can be fully tested by authenticating as two members with different
plan tiers, confirming each sees a distinct, tier-appropriate set of marketplace offers, and
that clicking through to an offer shows accurate product details.

**Acceptance Scenarios**:

1. **Given** an authenticated member, **When** they open the Marketplace, **Then** offers
   displayed are filtered to those compatible with their active plan tier and tenant.
2. **Given** a member on a Gold tier plan, **When** they browse offers, **Then** they do not
   see offers restricted to Silver-only tiers.
3. **Given** a member taps an offer card, **When** the detail view opens, **Then** pricing,
   coverage summary, and an "Express Interest" action are clearly presented.
4. **Given** a member expresses interest in a plan add-on, **When** they confirm, **Then**
   the member's broker receives a notification of the expressed interest.

---

### User Story 6 — Health Events Calendar & RSVP (Priority: P6)

An authenticated member views an interactive calendar displaying upcoming health events
organised by their health plan providers, including webinars, neighbourhood vaccination
clinics, and wellness workshops. Events are scoped to the member's tenant and plan tier.
Members can view event details and RSVP directly from within the application.

**Why this priority**: Event participation drives plan engagement and retention. It positions
the portal as a proactive health management tool beyond coverage display.

**Independent Test**: Can be fully tested by creating a tenant-scoped health event, confirming
it appears on the calendar for a member in that tenant, and verifying that an RSVP is recorded
and reflected in the member's upcoming events list.

**Acceptance Scenarios**:

1. **Given** an authenticated member, **When** they open the Events calendar, **Then** only
   events scoped to their tenant and plan tier are displayed.
2. **Given** an event is shown on the calendar, **When** the member taps it, **Then** they
   see the event title, date, time, location or virtual link, organiser, and description.
3. **Given** a member views an event, **When** they tap RSVP, **Then** their registration is
   confirmed, the event appears in their upcoming events list, and a confirmation notification
   is delivered.
4. **Given** a member has RSVP'd, **When** they view the event again, **Then** the RSVP
   button reflects their confirmed status and allows cancellation.

---

### User Story 7 — Care Finder & PCP Selection (Priority: P7)

An authenticated member searches for a Primary Care Provider (PCP) within their network.
They can filter by location, specialty, gender preference, and language. Each result
displays a network status badge indicating whether that provider accepts the member's
specific multi-tenant plan tier. The member can select a PCP or initiate a change request
from within the portal.

**Why this priority**: PCP selection reduces the friction of initiating care and prevents
claims rejections caused by out-of-network provider use. It is a direct patient safety and
cost-management feature.

**Independent Test**: Can be fully tested by searching for providers in a location, confirming
in-network versus out-of-network visual distinction based on the authenticated member's plan
tier, and verifying that a PCP selection or change request is recorded.

**Acceptance Scenarios**:

1. **Given** an authenticated member, **When** they open Care Finder and enter a search
   location, **Then** a list of PCPs is returned filtered to within a configurable radius.
2. **Given** search results are displayed, **When** a provider accepts the member's plan tier,
   **Then** an "In Network" badge is shown; when they do not, an "Out of Network" badge
   is shown.
3. **Given** a member taps a provider, **When** the detail screen opens, **Then** they see
   the provider's name, address, phone number, accepting-patients status, and network flag.
4. **Given** a member selects a PCP, **When** they confirm the selection, **Then** the change
   request is submitted, a confirmation is shown, and the request status is trackable.
5. **Given** a member filters by language or gender, **When** results are applied, **Then**
   only providers matching all active filters are displayed.

---

### Edge Cases

- What happens when a member's tenant configuration is unavailable at login (e.g., the
  tenant record is missing or corrupted)? The member must see a clear error and be directed
  to contact their broker — they must not land on a generic default tenant.
- What happens when a dependent's coverage has lapsed while the primary member's is active?
  The dependent must be clearly marked as inactive, and no digital card must be generated
  for them.
- What happens when a member in an area with no available in-network providers searches Care
  Finder? The system must provide a "no results" state with guidance on accessing out-of-
  network emergency care.
- What happens when the FHIR API returns a partial coverage record (some mandatory fields
  absent)? The portal must not display an incomplete card or mislead the member — a
  "coverage details unavailable" state must be shown.
- What happens when a marketplace offer's eligibility rules conflict with the member's current
  plan mid-session (e.g., a plan change occurs while browsing)? The session must refresh
  eligibility and remove no-longer-eligible offers before any expression of interest is
  submitted.
- What happens when a member attempts to RSVP to an event that has reached capacity? They
  must be offered a waitlist option or a clear "event full" message.

---

## Requirements *(mandatory)*

### Functional Requirements

**Identity & Tenant Management**

- **FR-001**: The system MUST resolve and apply a Tenant/District configuration on every
  authenticated session — including branding, plan catalogue, and notification rules — based
  on the member's registered Tenant ID.
- **FR-002**: The system MUST enforce tenant isolation so that no member can view or access
  data belonging to a different tenant.
- **FR-003**: The system MUST support multi-factor authentication as an optional or mandatory
  method per tenant policy.
- **FR-004**: The system MUST invalidate all locally held session credentials and remove
  visible PHI from the screen within 5 seconds of session expiry.

**Subscription & Plan**

- **FR-005**: The system MUST display the member's active plan tier, monthly premium, coverage
  effective date, coverage expiry date, and deductible progress as a unified view.
- **FR-006**: The system MUST display a complete, chronologically ordered payment history for
  the member's active and prior plan periods.
- **FR-007**: The system MUST display a renewal reminder when coverage is within 30 days of
  expiry.

**Dependents**

- **FR-008**: The system MUST allow a member to add, view, and remove dependents subject to
  their plan's allowed dependent count.
- **FR-009**: The system MUST generate a digital insurance card for each covered member and
  dependent displaying: full name, member ID, group number, plan tier, and coverage dates.
- **FR-010**: Digital insurance cards MUST be exportable or shareable by the member.

**Communication**

- **FR-011**: The system MUST deliver and display broker-originated policy communications
  (renewals, plan changes, enrollment notices) in a dedicated "Broker Notices" inbox segment.
- **FR-012**: The system MUST deliver and display tenant-originated localised alerts in a
  dedicated "District Updates" inbox segment.
- **FR-013**: Unread message counts MUST be displayed as badges on each inbox segment and
  on the application navigation entry point for the inbox.
- **FR-014**: The system MUST scope tenant notifications strictly to members of the originating
  tenant — cross-tenant broadcast is FORBIDDEN.

**Marketplace**

- **FR-015**: The system MUST display marketplace offers filtered to products compatible with
  the authenticated member's active plan tier and tenant eligibility rules.
- **FR-016**: The system MUST record a member's expressed interest in an offer and trigger a
  notification to the member's registered broker.
- **FR-017**: Marketplace offers MUST refresh eligibility at the point of interest submission
  to prevent stale offer acceptance.

**Events**

- **FR-018**: The system MUST display health events on a calendar interface, scoped to the
  member's tenant and plan tier.
- **FR-019**: The system MUST allow a member to RSVP to an event, recording the registration
  and providing a confirmatory notification.
- **FR-020**: The system MUST reflect event capacity limits and present a waitlist or "event
  full" state when capacity is reached.

**Care Finder**

- **FR-021**: The system MUST allow members to search for PCPs by geographic location with
  a configurable search radius.
- **FR-022**: Each provider in search results MUST display a network status indicator
  ("In Network" / "Out of Network") based on the authenticated member's plan tier.
- **FR-023**: The system MUST allow a member to submit a PCP selection or change request and
  display the submitted request status.
- **FR-024**: The system MUST support filtering Care Finder results by specialty, language,
  gender, and accepting-patients status.

**Security & Compliance (Non-Negotiable)**

- **FR-025**: No PHI (Protected Health Information) — including member names, IDs, diagnosis
  codes, or coverage details — may appear in application logs, analytics events, or external
  monitoring payloads.
- **FR-026**: Authentication tokens and any locally persisted health data MUST be stored in
  platform secure storage (not in unencrypted local storage).
- **FR-027**: All credential input fields (passwords, PINs, SSNs, medical IDs) MUST be
  rendered in a masked/secure input mode.

---

### Key Entities

- **Member**: The authenticated user. Attributes: unique member ID, full name, tenant ID,
  broker ID, plan enrollment(s), contact details, MFA preference.
- **Tenant / District**: The employer or geographic district organising the health plan. Attributes:
  tenant ID, display name, branding assets, notification rules, plan catalogue subset.
- **Broker**: The intermediary seller. Attributes: broker ID, name, assigned tenant(s), assigned
  members. Receives expressed-interest notifications and policy communication threads.
- **Plan Enrollment**: Links a member to a specific plan tier for a coverage period. Attributes:
  plan tier (Gold / Silver / HDHP / etc.), effective date, expiry date, premium amount, group
  number, deductible limit, deductible met.
- **Dependent**: A covered family member linked to a primary member's enrollment. Attributes:
  related-person ID, relationship, full name, date of birth, coverage status.
- **Digital Insurance Card**: A generated representation of coverage for a member or dependent.
  Attributes: member name, member ID, group number, plan tier, coverage dates, payer name.
- **Communication Message**: A message delivered to the member inbox. Attributes: message ID,
  channel (broker | district), subject, body, read status, delivery timestamp, sender reference.
- **Marketplace Offer**: A supplemental health product or wellness programme. Attributes: offer
  ID, product type, title, description, pricing, eligible plan tiers, eligible tenant IDs.
- **Health Event**: A provider-organised wellness activity. Attributes: event ID, title, date/time,
  location or virtual link, organiser, capacity, tenant scope, plan tier scope, RSVP count.
- **RSVP**: A member's registration for a health event. Attributes: RSVP ID, event ID, member ID,
  status (confirmed / waitlisted / cancelled), timestamp.
- **Provider (PCP)**: A primary care physician or practice. Attributes: provider ID, name, NPI,
  address, accepting-patients flag, specialty, languages spoken, gender, network participation
  by plan tier.

---

## Technical Interface Mapping *(FHIR-Aligned API Endpoints)*

> These endpoints align with HL7 FHIR R4 resource conventions. All requests carry an
> `Authorization: Bearer <token>` header. Tenant context is conveyed via a
> `X-Tenant-ID` header on every request. No PHI may appear in query string parameters.

### Identity & Session

| Operation | FHIR Basis | Endpoint |
|-----------|-----------|----------|
| Authenticate member | Custom auth | `POST /auth/token` |
| Fetch member profile | `Patient` | `GET /fhir/Patient/{memberId}` |
| Fetch tenant configuration | `Organization` | `GET /fhir/Organization/{tenantId}` |
| Resolve member-tenant link | `Coverage` | `GET /fhir/Coverage?subscriber={memberId}` |

### Subscription & Plan

| Operation | FHIR Basis | Endpoint |
|-----------|-----------|----------|
| Fetch active coverage | `Coverage` | `GET /fhir/Coverage/{coverageId}` |
| Fetch plan tier details | `InsurancePlan` | `GET /fhir/InsurancePlan/{planId}` |
| Fetch deductible accumulator | `ExplanationOfBenefit` | `GET /fhir/ExplanationOfBenefit?patient={memberId}&type=deductible` |
| Fetch payment history | Custom ledger | `GET /billing/payments?memberId={memberId}` |

### Dependents

| Operation | FHIR Basis | Endpoint |
|-----------|-----------|----------|
| List dependents | `RelatedPerson` | `GET /fhir/RelatedPerson?patient={memberId}` |
| Add dependent | `RelatedPerson` | `POST /fhir/RelatedPerson` |
| Remove dependent | `RelatedPerson` | `DELETE /fhir/RelatedPerson/{relatedPersonId}` |
| Fetch digital card (member) | `Coverage` | `GET /fhir/Coverage/{coverageId}/$card` |
| Fetch digital card (dependent) | `Coverage` | `GET /fhir/Coverage?beneficiary={relatedPersonId}&$card` |

### Communication

| Operation | FHIR Basis | Endpoint |
|-----------|-----------|----------|
| List broker messages | `Communication` | `GET /fhir/Communication?recipient={memberId}&category=broker` |
| List district notifications | `Communication` | `GET /fhir/Communication?recipient={memberId}&category=district` |
| Mark message read | `Communication` | `PATCH /fhir/Communication/{messageId}` |
| Get unread counts | Custom | `GET /messaging/unread-counts?memberId={memberId}` |

### Marketplace

| Operation | FHIR Basis | Endpoint |
|-----------|-----------|----------|
| List eligible offers | `InsurancePlan` | `GET /marketplace/offers?planTier={tier}&tenantId={tenantId}` |
| Get offer details | `InsurancePlan` | `GET /marketplace/offers/{offerId}` |
| Express interest | Custom | `POST /marketplace/interest` (body: `{ offerId, memberId }`) |

### Events

| Operation | FHIR Basis | Endpoint |
|-----------|-----------|----------|
| List events | `Appointment` | `GET /fhir/Appointment?actor={tenantId}&status=proposed` |
| Get event detail | `Appointment` | `GET /fhir/Appointment/{eventId}` |
| Submit RSVP | `AppointmentResponse` | `POST /fhir/AppointmentResponse` |
| Cancel RSVP | `AppointmentResponse` | `PUT /fhir/AppointmentResponse/{rsvpId}` |

### Care Finder

| Operation | FHIR Basis | Endpoint |
|-----------|-----------|----------|
| Search providers | `Practitioner` | `GET /fhir/Practitioner?near={lat,lon}&distance={km}` |
| Get provider detail | `PractitionerRole` | `GET /fhir/PractitionerRole?practitioner={providerId}` |
| Submit PCP change request | Custom | `POST /care/pcp-change` (body: `{ memberId, providerId }`) |
| Get PCP change status | Custom | `GET /care/pcp-change/{requestId}` |

---

## Component Visual Briefing *(React Native Paper)*

> All components MUST consume theme tokens via `useTheme()`. No hardcoded hex values.
> All layouts MUST use Flexbox structures compatible with React Native Web.

### Screen: Login

| UI Element | RNP Component | Notes |
|---|---|---|
| App header / tenant logo area | `<Surface>` | Elevated container; tenant branding applied via theme |
| Email input | `<TextInput mode="outlined">` | `keyboardType="email-address"` |
| Password input | `<TextInput mode="outlined" secureTextEntry>` | `secureTextEntry` is MANDATORY |
| Sign In button | `<Button mode="contained">` | Primary action |
| Forgot password link | `<Button mode="text">` | Secondary action |
| MFA prompt overlay | `<Portal>` + `<Modal>` | Rendered via Portal to avoid z-index conflicts |
| PIN / OTP input | `<TextInput mode="outlined" secureTextEntry>` | `secureTextEntry` MANDATORY |

### Screen: Home / Plan Overview

| UI Element | RNP Component | Notes |
|---|---|---|
| Page surface | `<Surface>` | Elevated background container |
| Plan tier card | `<Card>` + `<Card.Content>` | Displays tier name, premium, dates |
| Plan tier label chip | `<Chip>` | Gold / Silver / HDHP colour-coded via theme |
| Deductible progress | `<ProgressBar>` | `progress` prop set to `met / limit` |
| Renewal reminder banner | `<Banner>` | Visible only within 30-day expiry window |
| Payment history list | `<DataTable>` | Columns: Date, Amount, Status |
| Navigation tabs | `<BottomNavigation>` | Shared across all main screens |

### Screen: Dependents

| UI Element | RNP Component | Notes |
|---|---|---|
| Dependents list | `<List.Section>` + `<List.Item>` | Each item: avatar + name + coverage status |
| Dependent avatar | `<Avatar.Text>` | Initials-based; no photo required by default |
| Coverage status chip | `<Chip>` | Active / Inactive states via theme colour tokens |
| Add Dependent button | `<FAB icon="account-plus">` | Floating action button |
| Digital card view | `<Card>` + `<Card.Content>` full-screen | Rendered inside `<Portal>` + `<Modal>` |
| Share/export action | `<IconButton icon="share-variant">` | On digital card modal toolbar |

### Screen: Communication Inbox

| UI Element | RNP Component | Notes |
|---|---|---|
| Segment tabs | `<SegmentedButtons>` | "Broker Notices" / "District Updates" |
| Unread badge (per segment) | `<Badge>` | Overlaid on segment tab |
| Nav unread indicator | `<Badge>` | Overlaid on `<BottomNavigation>` inbox icon |
| Message list | `<List.Section>` + `<List.Item>` | Subject, sender, timestamp preview |
| Unread message marker | `<List.Item>` with `left` prop | Bold styling via theme `fontWeight` token |
| Message detail | `<Card>` + `<Card.Content>` | Full body rendered in scroll view |

### Screen: Marketplace

| UI Element | RNP Component | Notes |
|---|---|---|
| Offer card grid | `<Card>` + `<Card.Cover>` + `<Card.Content>` | Cover image + product summary |
| Eligibility label | `<Chip icon="check-circle">` | "Eligible for your plan" — theme green token |
| Offer detail modal | `<Portal>` + `<Modal>` | Pricing, coverage summary, CTA |
| Express Interest button | `<Button mode="contained">` | Triggers interest submission |
| Confirmation snackbar | `<Snackbar>` | Shown on successful interest submission |

### Screen: Events Calendar

| UI Element | RNP Component | Notes |
|---|---|---|
| Calendar container | `<Surface>` | Wraps the calendar view |
| Event list (day view) | `<List.Section>` + `<List.Item>` | Event title, time, organiser |
| Event organiser avatar | `<Avatar.Icon icon="hospital-building">` | Provider icon |
| Event detail | `<Card>` + `<Card.Content>` | Full details + RSVP action |
| RSVP button | `<Button mode="contained">` | Primary action; changes to "Confirmed" post-RSVP |
| RSVP confirmed chip | `<Chip icon="calendar-check">` | Shown in place of RSVP button after confirmation |
| Capacity full state | `<Banner>` | Displayed when event at capacity |
| Waitlist button | `<Button mode="outlined">` | Shown when capacity is reached |

### Screen: Care Finder

| UI Element | RNP Component | Notes |
|---|---|---|
| Search input | `<Searchbar>` | Location or provider name search |
| Filter chips row | `<Chip>` (multiple, scrollable) | Specialty / Language / Gender / Accepting |
| Provider result card | `<Card>` + `<Card.Content>` | Name, address, specialty |
| In-Network badge | `<Chip icon="shield-check">` | Theme primary colour token |
| Out-of-Network badge | `<Chip icon="shield-off">` | Theme error colour token |
| Provider detail sheet | `<Surface>` in bottom sheet | Address, phone, network status, accepting-patients |
| Select PCP button | `<Button mode="contained">` | Submits change request |
| Request status indicator | `<Chip>` | Pending / Confirmed states |

### Shared / Navigation

| UI Element | RNP Component | Notes |
|---|---|---|
| Top navigation bar | `<Appbar.Header>` | Tenant logo left; profile icon right |
| Back navigation | `<Appbar.BackAction>` | Standard back affordance |
| App-wide provider | `<Provider>` | MUST wrap the entire application at root |
| Loading states | `<ActivityIndicator>` | Centred in content area; never block full screen with spinner > 3s |
| Error state | `<Banner>` | Non-dismissible for critical errors (auth failures, API outages) |
| Dividers | `<Divider>` | Between list sections; respects theme spacing |

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A member belonging to any tenant can complete the full sign-in flow and see
  their tenant-branded home screen within 5 seconds of submitting credentials on a standard
  mobile connection.
- **SC-002**: Tenant data isolation is 100% enforced — zero cross-tenant data exposures
  detectable in any automated security test suite.
- **SC-003**: Members can view their full plan overview (tier, premium, deductible, effective
  dates) within 3 taps from the home screen.
- **SC-004**: 95% of inbox messages are delivered and visible within 60 seconds of the
  sending event occurring on the backend.
- **SC-005**: A member can add a new dependent and receive their digital insurance card within
  2 minutes of completing the dependent form.
- **SC-006**: Care Finder returns a first page of results within 3 seconds for any location
  search query.
- **SC-007**: 90% of members who initiate a PCP change request through the portal experience
  no claim rejections attributable to stale PCP data within a 90-day window.
- **SC-008**: All four platform targets (iOS, Android, Web on desktop, Web on mobile) render
  all seven user story flows with no loss of functionality or layout breakage.
- **SC-009**: PHI audit scans of application logs and analytics events yield zero PHI
  exposures in any test environment or production deployment.
- **SC-010**: A member with no prior experience of the portal can RSVP to a health event
  within 3 minutes of opening the Events screen for the first time.

---

## Assumptions

- Members have a stable internet connection sufficient to load FHIR API responses; offline-
  first data caching for plan details and digital cards is desirable but out of scope for v1.
- Each member is registered to exactly one Tenant/District at a time; cross-tenant membership
  migration is an administrative operation outside the member portal.
- Tenant branding assets (logo, colour palette mapped to MD3 tokens) are pre-provisioned by
  an administrative tool before members authenticate; the portal only consumes them.
- FHIR R4 endpoints are provided by an existing backend health data platform; the portal is
  a consumer, not the data source.
- Broker and district notification delivery uses an existing messaging infrastructure; the
  portal consumes the `Communication` FHIR resource feed.
- The care provider directory (Practitioner / PractitionerRole) is maintained by the health
  plan network operations team and is current; the portal reflects but does not edit this data.
- Multi-factor authentication capability is present in the authentication service; the portal
  surfaces the MFA challenge but does not own the MFA logic.
- Marketplace offer eligibility rules are computed server-side; the portal only displays
  pre-filtered results and does not apply client-side eligibility logic.
- Event capacity management and waitlist processing are handled server-side; the portal
  reflects current state and does not enforce capacity locally.
- The maximum number of dependents per plan is enforced by the FHIR Coverage resource
  constraints; the portal surfaces the error returned by the API.

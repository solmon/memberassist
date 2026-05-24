# Research: Thrive Portal — Core Member Application

**Phase 0 output** | Branch: `001-thrive-portal-core` | Date: 2026-05-22

All questions originate from the Technical Context unknowns and dependency best-practice
requirements. No NEEDS CLARIFICATION items remain after this research pass.

---

## R-01: Prisma + MSSQL Multi-Tenant Isolation Pattern

**Decision**: Enforce multi-tenant isolation at the Prisma query layer using a mandatory
`tenantId` column on every tenant-scoped model, passed as a required argument through
every Service method. No row-level security (RLS) feature of MSSQL is used for primary
isolation — application-layer enforcement via Prisma `where: { tenantId }` is the
authoritative gate.

**Rationale**: MSSQL RLS is opaque to Prisma's type system and can be silently bypassed by
DBA-level queries. Application-layer enforcement via typed Service arguments is auditable,
testable, and surfaced in TypeScript's type checker. Constitution Principle V explicitly
mandates `tenantId` FK on every model — this pattern implements that mandate.

**Alternatives considered**:
- MSSQL Row-Level Security (RLS): Rejected — not surfaced in Prisma types, complex to test,
  risk of silent bypass by db-admin tooling.
- Separate schema per tenant: Rejected — Prisma does not natively support runtime schema
  switching with a single `schema.prisma`; operational complexity is unjustifiable for v1.
- JWT claim validation only at controller layer: Rejected — insufficient; service layer could
  be called internally without the JWT guard, bypassing tenant scope.

---

## R-02: NestJS JWT Guard + Tenant Extraction Pattern

**Decision**: Issue JWTs containing `{ sub: memberId, tenantId, role }` claims. A global
`JwtAuthGuard` validates every request. A custom `@TenantId()` parameter decorator extracts
`tenantId` from `request.user` and passes it as a typed argument to every controller method,
which forwards it to the service. No controller method may call a service that touches tenant-
scoped data without explicitly passing `tenantId`.

**Rationale**: Co-locating `tenantId` in the JWT payload eliminates a round-trip to the
database to resolve the tenant on every request, while keeping the tenant scope immutable
for the lifetime of the token.

**Alternatives considered**:
- Per-request tenant lookup from DB: Rejected — adds latency to every API call and creates
  a single point of failure if the tenant table is briefly unavailable.
- Subdomain-based tenant resolution: Rejected — React Native apps do not operate via browser
  subdomains; a header/token approach is required.

---

## R-03: Docker Compose MSSQL Health Check Strategy

**Decision**: Use a `healthcheck` on the `mssql` service using `/opt/mssql-tools18/bin/sqlcmd`
to issue a `SELECT 1` probe with `-No` (trust server certificate) and `-C` flags. The `api`
service declares `depends_on: mssql: condition: service_healthy`. NestJS bootstrap includes
a retry loop in `PrismaService.onModuleInit()` — up to 10 attempts with 3s delay — to handle
the window between MSSQL reporting healthy and accepting TCP connections.

**Rationale**: MSSQL's container healthcheck only confirms the sqlcmd binary can connect, not
that the TCP listener is fully ready for Prisma's TDS protocol. The NestJS retry loop covers
this gap without adding `sleep` hacks to the Compose file.

**Alternatives considered**:
- `wait-for-it.sh` script: Rejected — only checks TCP port availability, not actual MSSQL
  readiness; also adds an external script dependency.
- `restart: on-failure` without health check: Rejected — NestJS may start and hard-crash
  before MSSQL is ready, creating restart noise in logs.

---

## R-04: Prisma MSSQL UUID Primary Key

**Decision**: Use `@default(uuid())` for all primary keys. Prisma maps this to a
`UNIQUEIDENTIFIER` column in MSSQL. While sequential `IDENTITY` keys have slightly better
clustered index performance, UUID v4 keys are required here to: (a) prevent member ID
enumeration attacks (OWASP IDOR), (b) allow client-generated IDs for optimistic inserts, and
(c) comply with FHIR resource ID conventions.

**Rationale**: OWASP Top 10 A01 (Broken Access Control) risk of sequential IDs exposing
membership counts is unacceptable for a HIPAA-regulated application. UUID cost on index
fragmentation is manageable via periodic MSSQL index maintenance jobs.

**Alternatives considered**:
- `IDENTITY(1,1)` auto-increment: Rejected — sequential IDs expose member enumeration vector.
- ULID (sortable UUID): Considered — good insert performance, maintains sort order. Not
  natively supported by Prisma's `@default()` for MSSQL without custom generator. Deferred
  to v2 if index fragmentation becomes a measurable problem.

---

## R-05: `expo-secure-store` vs `react-native-keychain` Decision

**Decision**: Use `expo-secure-store` exclusively for all on-device credential and token
storage in the mobile app. `react-native-keychain` is not included as a dependency.

**Rationale**: `expo-secure-store` is the standard Expo SDK package, backed by iOS Keychain
and Android Keystore. Adding `react-native-keychain` alongside it creates two APIs for the
same concern, violating Principle IV (Code Quality & Precision). `expo-secure-store` covers
all required operations: `setItemAsync`, `getItemAsync`, `deleteItemAsync` with biometric
access control options.

**Alternatives considered**:
- `react-native-keychain`: Considered — more granular access control options. Rejected for
  v1: `expo-secure-store` is sufficient, and mixing two secure storage libraries introduces
  risk of divergent token management logic.

---

## R-06: State Management — Zustand vs RTK Query Boundary

**Decision**: Zustand manages session state (`authStore`: JWT, decoded claims, loading/error
flags) and tenant UI configuration (`tenantStore`: branding tokens, plan catalogue). All
server data fetching (plans, dependents, messages, marketplace, events, providers) uses RTK
Query with per-endpoint cache tags for invalidation.

**Rationale**: Session state is synchronous, frequently read, and never persisted to the
server — Zustand is the correct tool. Server data is async, cacheable, and needs
invalidation on mutations — RTK Query handles this correctly. Mixing the two in the wrong
direction (RTK for session, Zustand for server cache) would violate separation of concerns.

**Alternatives considered**:
- Zustand for everything: Rejected — manual cache invalidation and loading state management
  for server data is error-prone and recreates RTK Query's solved problem.
- React Query (TanStack Query) instead of RTK Query: Considered — equally capable. RTK Query
  is preferred because the project already uses `@reduxjs/toolkit` for type-safe action
  dispatch and the teams are familiar with the RTK ecosystem.

---

## R-07: NestJS Module Communication — No Circular Dependencies

**Decision**: Define a strict dependency graph. Only the following inter-module dependencies
are permitted at launch: `AuthModule` imports `MembersModule` (to resolve member by email).
`PlansModule` imports `TenantsModule` (to validate plan belongs to tenant). All other modules
are leaf nodes — they do not import from each other. Cross-cutting concerns (tenant guard,
JWT guard, logging) are provided as global guards/interceptors via `APP_GUARD` and
`APP_INTERCEPTOR` tokens.

**Rationale**: NestJS circular dependency errors at runtime are a common source of startup
failures. Enforcing a DAG (directed acyclic graph) of module imports at design time prevents
this class of defect.

**Alternatives considered**:
- `forwardRef()` circular references: Rejected — `forwardRef` is a code smell indicating a
  design problem. Resolve the dependency inversion instead.

---

## R-08: HIPAA PHI Log Stripping Strategy

**Decision**: Implement a `PhiRedactionInterceptor` (NestJS `NestInterceptor`) that strips
a configurable set of field names (`memberId`, `dateOfBirth`, `ssn`, `medicalId`,
`firstName`, `lastName`, `email`, `phoneNumber`, `address`) from outbound response logs and
inbound request body logs. The interceptor is registered globally via `APP_INTERCEPTOR`. In
development, a summary log line is emitted (e.g., `[GET /members/:id] → 200`) with no body
content. In production, structured logs (JSON) include only method, path, statusCode, and
`durationMs`.

**Rationale**: Logging PHI to any sink (stdout, file, APM) is a HIPAA violation. Stripping
at the interceptor layer is the single authoritative control point — it covers all routes
without per-controller annotation.

**Alternatives considered**:
- Per-route `@SkipLogging()` decorator: Rejected — opt-out model means new routes are logged
  by default, creating a risk of accidental PHI exposure when a developer forgets to annotate.
  Opt-in logging (log nothing PHI by default) is the safer posture.

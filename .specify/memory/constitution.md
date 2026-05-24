<!--
SYNC IMPACT REPORT
==================
Version change: 1.1.0 → 1.2.0

Rationale for MINOR bump: Monorepo structure and pnpm package manager mandate added.
Material new guidance added to Principle I (monorepo workspace conventions) and Principle VI
(pnpm in Docker, pnpm-workspace.yaml). Development Workflow updated to replace all npm
references with pnpm equivalents. No principles removed or redefined.

Modified principles:
  - Principle I (Architecture & Type Safety): Added "Monorepo & Package Management" sub-section.
    pnpm workspaces mandated; npm FORBIDDEN; optional packages/shared workspace described.
  - Principle VI (Infrastructure & Local Development): Updated Docker/Compose rules to require
    pnpm installation in builder stage and `pnpm install --frozen-lockfile`. `npm ci` FORBIDDEN
    in Dockerfiles.

Updated sections:
  - Compliance & Operations: `npm audit` replaced with `pnpm audit`.
  - Development Workflow: All npm install/run commands replaced with pnpm equivalents;
    workspace-filter pattern (`pnpm --filter <pkg> <cmd>`) added; `pnpm-lock.yaml` committed
    rule added; `pnpm-workspace.yaml` required at repo root.

Templates reviewed:
  ✅ .specify/memory/constitution.md (this file — updated)
  ✅ .specify/templates/plan-template.md (generic; pnpm commands apply at implementation time)
  ✅ .specify/templates/spec-template.md (no package manager references; no change needed)
  ✅ .specify/templates/tasks-template.md (path conventions unchanged; pnpm filter pattern
     applies when speckit.implement generates tasks for api/ and mobile/ workspaces)

Deferred TODOs: None — all placeholders resolved.
-->

# Thrive Health Plan Portal Constitution

## Core Principles

### I. Architecture & Type Safety

**Front-End Stack:**

- **Framework:** React Native, targeting iOS, Android, and Web via React Native Web.
- **Language:** TypeScript. `any` types are FORBIDDEN across the entire codebase — both
  front-end and back-end.
- **Component Model:** Functional components only with explicit TypeScript prop interfaces.
  Business logic MUST be separated into custom hooks.
- **Preferred State & Data Fetching:** Zustand for UI/global state; RTK Query for FHIR API
  data fetching. Mixing of additional state management paradigms requires explicit justification.

**Back-End Stack:**

- **Framework:** NestJS with strict TypeScript (`strict: true` in `tsconfig.json`).
- **ORM:** Prisma — the sole permitted database access layer. Raw SQL queries are FORBIDDEN
  unless the required operation is provably impossible via the Prisma query API.
- **Database:** Microsoft SQL Server (MSSQL), optimised for enterprise performance.
- **Runtime:** Node.js LTS. No mixing of CommonJS and ESM modules within a single service.

**Monorepo & Package Management:**

- The repository MUST be structured as a **pnpm workspace monorepo**. The root MUST contain
  a `pnpm-workspace.yaml` declaring the workspace packages (at minimum `api` and `mobile`).
- **pnpm** is the sole permitted package manager. `npm` and `yarn` are FORBIDDEN for
  install, run, and publish operations at any workspace level.
- A `pnpm-lock.yaml` lockfile MUST be committed to version control and kept up to date.
  Installing packages without updating the lockfile (`--no-lockfile`) is FORBIDDEN.
- Workspace packages MUST declare their inter-dependencies using the `workspace:` protocol
  (e.g., `"@thrive/shared": "workspace:*"`) when one workspace consumes another.
- A `packages/shared` workspace (e.g., `@thrive/shared`) MAY be used to house shared
  TypeScript types and DTO interfaces consumed by both `api` and `mobile`. If created, it
  MUST be a pure TypeScript package with no runtime dependencies on framework-specific code.
- Workspace-scoped commands MUST use the pnpm filter flag:
  `pnpm --filter api <command>` and `pnpm --filter mobile <command>`.

**Rationale:** A unified TypeScript contract across both layers reduces integration defects,
eliminates type drift between API and consumer, and ensures data integrity in a regulated
healthcare application deployed across four targets (iOS, Android, Web, MSSQL server).
A pnpm monorepo enables shared types, consistent dependency hoisting, and faster installs
via the content-addressable store, while eliminating the tooling fragmentation caused by
mixing npm and yarn.

### II. UI Consistency (React Native Paper / MD3)

**Component & Styling Rules:**

- `react-native-paper` components MUST be used exclusively. Custom wrappers MUST NOT be built
  if an equivalent component already exists in the library.
- All styling MUST consume Material Design 3 theme tokens via `useTheme()`.
  Hardcoded hex colour values are FORBIDDEN.
- Elevated cards and containers MUST use `<Surface>`. The `<Provider>` component MUST be
  present at the application root.
- All layout components MUST use standard Flexbox structures compatible with React Native Web.

**Rationale:** A single enforced design system prevents UI fragmentation, ensures cross-platform
consistency (iOS, Android, Web), and eliminates redundant component creation.

### III. HIPAA Security & Privacy (NON-NEGOTIABLE)

**Front-End Data Handling:**

- Protected Health Information (PHI) MUST NEVER appear in `console.log`, error reporting
  services, analytics pipelines, or any external monitoring tooling — on either the front-end
  or back-end.
- Sensitive credentials, user tokens, and health data MUST be stored on-device using
  `expo-secure-store`. Vanilla `AsyncStorage` is FORBIDDEN for any sensitive data.
- All inputs collecting passwords, SSNs, or medical IDs MUST use `secureTextEntry` or an
  approved masked input variant.

**Back-End Data Handling:**

- All user credentials (passwords, PINs) MUST be hashed using a strong, salted algorithm
  (e.g., bcrypt or Argon2) before persistence. Plaintext credential storage is FORBIDDEN.
- Database connection strings, API secrets, and service keys MUST be supplied exclusively via
  environment variables loaded from `.env` files. These files MUST NEVER be committed to
  version control. A `.env.example` (with no real values) MUST be maintained.
- Back-end request/response logging MUST strip all PHI fields before writing any log line.

**Rationale:** HIPAA mandates strict controls over PHI access, transmission, and storage at
every layer of the stack. Violations carry severe legal and financial penalties. These rules
apply equally in development, staging, and production environments with zero exceptions.

### IV. Code Quality & Precision

**Output Standards:**

- All committed code MUST be production-ready TypeScript on both front-end and back-end.
  Placeholder comments such as `// TODO: implement later` are FORBIDDEN in committed code.
- Code changes MUST be focused and minimal. Unaffected files MUST NOT be rewritten or
  refactored speculatively.
- Each change MUST deliver complete foundational logic; partial stubs are not permitted.

**Rationale:** Precision reduces review burden, prevents accidental regressions, and maintains
a clean, auditable history suitable for a regulated healthcare environment.

### V. Back-End & Database Patterns

**NestJS Architecture:**

- All back-end features MUST be implemented using NestJS's standard modular structure:
  `@Module`, `@Controller`, and `@Injectable` (Service).
- All API payloads (request bodies, query parameters) MUST be validated using Data Transfer
  Objects (DTOs) decorated with `class-validator` and transformed with `class-transformer`.
  Unvalidated raw request data MUST NEVER be passed directly to service or ORM layers.
- NestJS global validation pipe (`ValidationPipe`) MUST be enabled with
  `whitelist: true` and `forbidNonWhitelisted: true`.

**Prisma Schema Rules:**

- Every Prisma model MUST explicitly define:
  - A `tenantId` (and/or `districtId`) foreign key column to enforce multi-tenant isolation.
  - Explicit `@@index` declarations for all columns used in `WHERE` clauses or JOIN conditions.
  - Explicit relations with `@relation` directives — implicit relation inference is FORBIDDEN.
- Schema migrations MUST be generated via `prisma migrate dev` and committed to version
  control. Direct schema edits in the production database bypassing migrations are FORBIDDEN.

**MSSQL Column Conventions:**

- String columns MUST use `@db.NVarChar(n)` or `@db.NVarChar(Max)` as appropriate.
  `VARCHAR` (non-unicode) is FORBIDDEN for any column that may hold user-generated content.
- Timestamp columns MUST use `@db.DateTime2` for precision.
- Primary keys MUST use `@default(uuid())` (UUID v4) unless a sequential integer key is
  explicitly justified for a specific performance or reporting requirement.

**Rationale:** Consistent back-end patterns ensure that multi-tenant data isolation is
structurally enforced at the schema level, that all API surface is validated before reaching
business logic, and that MSSQL-specific behaviours (Unicode, precision timestamps) do not
cause silent data corruption.

### VI. Infrastructure & Local Development

**Containerisation Rules:**

- All back-end services (NestJS API, MSSQL database) MUST be runnable locally via
  `docker compose up` without any manual environment configuration beyond copying `.env.example`
  to `.env` and supplying required secrets.
- Docker Compose service definitions MUST pin explicit image tags. `latest` tags are FORBIDDEN.
- The MSSQL service in Docker Compose MUST be configured with a health check so that the
  NestJS service does not start before the database is ready.
- Front-end local development (React Native / Expo) runs outside Docker; the Compose stack
  provides only the back-end API and database.
- Dockerfiles for Node.js services MUST install pnpm globally before running any install
  command (e.g., `RUN npm install -g pnpm`). `npm ci` is FORBIDDEN in Dockerfiles.
- Production Docker builds MUST use `pnpm install --frozen-lockfile` to ensure reproducible
  installs. `pnpm-lock.yaml` MUST be present in the Docker build context.
- Multi-stage Dockerfiles MUST copy `pnpm-lock.yaml` and the root `pnpm-workspace.yaml`
  alongside the workspace package files to ensure pnpm can resolve workspace dependencies
  during the build.

**Rationale:** Reproducible local development environments eliminate "works on my machine"
defects, accelerate onboarding, and ensure that CI pipelines can run against the same
containerised infrastructure used by developers. Using pnpm in Docker aligns the container
build with the monorepo package manager, preventing lockfile drift and ensuring the same
dependency graph used in development is frozen into the production image.

## Compliance & Operations

- HIPAA compliance MUST be verified as part of every code review — both front-end and back-end
  changes are in scope.
- Any new dependency MUST be evaluated for PHI exposure risk and supply-chain security before
  merging. Back-end packages MUST be checked with `pnpm audit` or equivalent.
- `expo-secure-store` usage MUST be audited each release cycle on the front-end.
  Back-end `.env` variable coverage MUST be audited to ensure no credential has been
  hard-coded since the previous release.
- All four platform targets (iOS, Android, Web, and back-end API via Docker) MUST be
  verified before a feature is considered complete.
- `.env` files containing real credentials MUST NEVER be committed. CI pipelines MUST inject
  secrets via environment injection, not via committed files.

## Development Workflow

- Branch strategy: feature branches from `main`; naming convention `###-feature-name`.
- Pull requests MUST pass all TypeScript strict-mode checks and linting gates (front-end
  and back-end) before peer review begins.
- Any change touching authentication, health data models, secure storage, or Prisma schema
  MUST include a security-focused peer review.
- Cross-platform compatibility (iOS, Android, Web) MUST be verified for all UI-layer changes.
- Prisma schema changes MUST be accompanied by a migration file generated by
  `prisma migrate dev`. PRs without the migration file for schema changes will be rejected.
- Back-end DTO changes that alter API contracts MUST be communicated to front-end consumers
  before merging.
- `pnpm-lock.yaml` MUST be committed and kept current. PRs that modify `package.json` files
  without a corresponding `pnpm-lock.yaml` update will be rejected.
- Root-level workspace commands MUST be run with pnpm: `pnpm install`, `pnpm run build`,
  `pnpm run lint`. Workspace-scoped commands MUST use the filter flag:
  `pnpm --filter api build`, `pnpm --filter mobile start`.

## Governance

This constitution supersedes all other development practices, style guides, and informal
agreements for the Thrive Health Plan Portal.

Amendments require:
1. A documented rationale explaining the principle being changed.
2. Review and approval from a core maintainer.
3. A migration plan where existing code is non-compliant with the amended principle.
4. A version increment per semantic rules:
   - **MAJOR:** Principle removal, redefinition, or backward-incompatible governance change.
   - **MINOR:** New principle or section added, or material expansion of existing guidance.
   - **PATCH:** Clarifications, wording fixes, or non-semantic refinements.

All pull requests and code reviews MUST verify compliance with all six core principles.
Complexity introduced beyond what is strictly required MUST be justified against Principle IV.

**Version**: 1.2.0 | **Ratified**: 2026-05-22 | **Last Amended**: 2026-05-22

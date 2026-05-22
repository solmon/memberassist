<!--
SYNC IMPACT REPORT
==================
Version change: [PLACEHOLDER] → 1.0.0

Added sections:
  - Core Principles (4 principles replacing all template placeholders)
      I.  Architecture & Type Safety
      II. UI Consistency (React Native Paper / MD3)
      III. HIPAA Security & Privacy (NON-NEGOTIABLE)
      IV. Code Quality & Precision
  - Compliance & Operations (replaces generic SECTION_2)
  - Development Workflow (replaces generic SECTION_3)
  - Governance (filled from template placeholder)

Templates reviewed:
  ✅ .specify/memory/constitution.md (this file — updated)
  ✅ .specify/templates/plan-template.md (Constitution Check section is feature-driven; no changes needed)
  ✅ .specify/templates/spec-template.md (generic structure; compatible with new principles)
  ✅ .specify/templates/tasks-template.md (mobile/web path conventions already supported)

Deferred TODOs: None — all placeholders resolved.
-->

# Thrive Health Plan Portal Constitution

## Core Principles

### I. Architecture & Type Safety

**Tech Stack:**

- **Framework:** React Native, targeting iOS, Android, and Web via React Native Web.
- **Language:** TypeScript. `any` types are FORBIDDEN throughout the entire codebase.
- **State Management:** Zustand for UI/global state; RTK Query for all FHIR API data fetching.
  No mixing of state management paradigms.
- **Component Model:** Functional components only with explicit TypeScript prop interfaces.
  Business logic MUST be separated into custom hooks.

**Rationale:** A strictly typed, consistent architecture is necessary to maintain data integrity
and code reliability in a regulated healthcare application deployed across three platforms.

### II. UI Consistency (React Native Paper / MD3)

**Component & Styling Rules:**

- `react-native-paper` components MUST be used exclusively. Custom wrappers MUST NOT be built
  if an equivalent component already exists in the library.
- All styling MUST consume Material Design 3 theme tokens via `useTheme()`.
  Hardcoded hex colour values are FORBIDDEN.
- Elevated cards and containers MUST use `<Surface>`. The `<Provider>` component MUST be
  present at the application root.
- Buttons MUST use `<Button>` with a correct mode value: `contained`, `outlined`, or `text`.
- Icons MUST use built-in MaterialCommunityIcons via the `icon` prop string.
- All layout components MUST use standard Flexbox structures compatible with React Native Web.

**Rationale:** A single enforced design system prevents UI fragmentation, ensures cross-platform
consistency (iOS, Android, Web), and eliminates redundant component creation.

### III. HIPAA Security & Privacy (NON-NEGOTIABLE)

**Data Handling:**

- Protected Health Information (PHI) MUST NEVER appear in `console.log`, error reporting
  services, analytics pipelines, or any external monitoring tooling.
- Sensitive credentials, user tokens, and health data MUST be stored using `expo-secure-store`
  or `react-native-keychain`. Vanilla `AsyncStorage` is FORBIDDEN for any sensitive data.
- All inputs collecting passwords, SSNs, or medical IDs MUST use `secureTextEntry` or an
  approved masked input variant.

**Rationale:** HIPAA mandates strict controls over PHI access, transmission, and storage.
Violations carry severe legal and financial penalties. These rules apply equally in development
and production environments with zero exceptions.

### IV. Code Quality & Precision

**Output Standards:**

- All committed code MUST be production-ready TypeScript. Placeholder comments such as
  `// TODO: implement later` are FORBIDDEN in committed code.
- Code changes MUST be focused and minimal. Unaffected files MUST NOT be rewritten or
  refactored speculatively.
- Each change MUST deliver complete foundational logic; partial stubs are not permitted.

**Rationale:** Precision reduces review burden, prevents accidental regressions, and maintains
a clean, auditable history suitable for a regulated healthcare environment.

## Compliance & Operations

- HIPAA compliance MUST be verified as part of every code review.
- Any new dependency MUST be evaluated for PHI exposure risk before merging.
- Secure storage APIs (`expo-secure-store`, `react-native-keychain`) MUST be audited each
  release cycle to confirm correct and complete usage.
- All three platform targets (iOS, Android, Web) MUST be tested before a feature is
  considered complete.

## Development Workflow

- Branch strategy: feature branches from `main`; naming convention `###-feature-name`.
- Pull requests MUST pass all TypeScript strict-mode checks and linting gates before review.
- Any change touching authentication, health data models, or secure storage MUST include a
  security-focused peer review.
- Cross-platform compatibility (iOS, Android, Web) MUST be verified for all UI-layer changes.

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

All pull requests and code reviews MUST verify compliance with the four core principles.
Complexity introduced beyond what is strictly required MUST be justified against Principle IV.

**Version**: 1.0.0 | **Ratified**: 2026-05-22 | **Last Amended**: 2026-05-22

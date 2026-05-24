# Implementation Plan: Thrive Portal — Core Member Application

**Branch**: `001-thrive-portal-core` | **Date**: 2026-05-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-thrive-portal-core/spec.md`

## Summary

Build the full-stack Thrive Health Plan Portal: a multi-tenant, HIPAA-compliant member
application targeting iOS, Android, and Web. The front-end is a React Native + React Native
Paper app consuming a NestJS REST API backed by Prisma ORM against Microsoft SQL Server.
Local development runs entirely via Docker Compose. The portal delivers seven member-facing
feature areas: tenant-scoped identity, subscription/plan overview, dependents & digital ID
cards, omnichannel communication inbox, provider marketplace, health events calendar, and
care finder / PCP selection.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enforced on both front-end and back-end).
Node.js LTS (v22) for the NestJS back-end. React Native via Expo SDK 52+ for the front-end.

**Primary Dependencies**:
- Front-End: `react-native`, `expo`, `react-native-paper` (MD3), `react-native-web`,
  `zustand`, `@reduxjs/toolkit` + `react-query` (RTK Query), `expo-secure-store`
- Back-End: `@nestjs/core`, `@nestjs/common`, `@nestjs/jwt`, `@nestjs/passport`,
  `@prisma/client`, `prisma`, `class-validator`, `class-transformer`, `bcrypt`, `passport-jwt`
- Infra: Docker Engine 26+, Docker Compose v2, `mcr.microsoft.com/mssql/server:2022-CU12-ubuntu-22.04`

**Storage**: Microsoft SQL Server 2022 (MSSQL) via Prisma ORM (`provider = "sqlserver"`).

**Testing**: Jest + `@nestjs/testing` (back-end unit + integration); Jest + React Native
Testing Library (front-end component tests).

**Target Platform**: iOS 16+, Android 13+, Web (React Native Web via Expo), NestJS REST API
on Linux (Docker container).

**Project Type**: Mobile + Web app (React Native) consuming a NestJS REST API.

**Performance Goals**: REST API p95 response ≤ 200ms for all member-facing read endpoints.
Front-end first-meaningful-paint ≤ 3s on a standard 4G connection. Care Finder first results
page ≤ 3s.

**Constraints**: All PHI must be stripped from logs. No credentials in version control. Tenant
data isolation 100% enforced at the database query level via `tenantId` filter on every Prisma
query. Offline caching is out of scope for v1.

**Scale/Scope**: ~7 feature areas, ~30 REST endpoints, ~11 Prisma models, 4 deployment
targets (iOS, Android, Web, Docker API).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|---|---|---|
| I — Architecture & Type Safety | TypeScript strict mode on both layers; Prisma as sole ORM; no `any` | ✅ PASS — all stack choices comply |
| II — UI Consistency | RNP components exclusively; no hardcoded hex; `useTheme()` for all styling | ✅ PASS — front-end plan enforces this |
| III — HIPAA Security & Privacy | PHI never logged; `expo-secure-store` on-device; bcrypt hashing; `.env` for secrets | ✅ PASS — all handling rules accounted for |
| IV — Code Quality & Precision | No TODOs in committed code; minimal focused changes; full foundational logic | ✅ PASS — plan scope is deliberately bounded |
| V — Back-End & Database Patterns | NestJS Module/Controller/Service; DTOs with class-validator; `tenantId` FK on every model; explicit `@@index`; `NVarChar`/`DateTime2`; UUID PKs | ✅ PASS — schema and module plan comply |
| VI — Infrastructure & Local Dev | Docker Compose for API + MSSQL; pinned image tags; MSSQL health check before API start | ✅ PASS — Compose plan complies |

**Post-Design Re-check** (after Phase 1): All six principles remain satisfied after data model
and contract design. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-thrive-portal-core/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── auth.md
│   ├── members.md
│   ├── plans.md
│   ├── dependents.md
│   ├── communications.md
│   ├── marketplace.md
│   ├── events.md
│   └── care-finder.md
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
api/                          # NestJS back-end
├── src/
│   ├── main.ts               # Bootstrap: global pipes, Swagger, CORS
│   ├── app.module.ts         # Root module
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   └── modules/
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── strategies/
│       │   │   └── jwt.strategy.ts
│       │   └── dto/
│       │       ├── login.dto.ts
│       │       └── token-response.dto.ts
│       ├── tenants/
│       │   ├── tenants.module.ts
│       │   ├── tenants.controller.ts
│       │   ├── tenants.service.ts
│       │   └── dto/
│       │       └── tenant-config.dto.ts
│       ├── members/
│       │   ├── members.module.ts
│       │   ├── members.controller.ts
│       │   ├── members.service.ts
│       │   └── dto/
│       │       ├── member-profile.dto.ts
│       │       └── update-member.dto.ts
│       ├── plans/
│       │   ├── plans.module.ts
│       │   ├── plans.controller.ts
│       │   ├── plans.service.ts
│       │   └── dto/
│       │       └── enrollment.dto.ts
│       ├── dependents/
│       │   ├── dependents.module.ts
│       │   ├── dependents.controller.ts
│       │   ├── dependents.service.ts
│       │   └── dto/
│       │       ├── create-dependent.dto.ts
│       │       └── dependent.dto.ts
│       ├── communications/
│       │   ├── communications.module.ts
│       │   ├── communications.controller.ts
│       │   ├── communications.service.ts
│       │   └── dto/
│       │       └── message.dto.ts
│       ├── marketplace/
│       │   ├── marketplace.module.ts
│       │   ├── marketplace.controller.ts
│       │   ├── marketplace.service.ts
│       │   └── dto/
│       │       ├── offer.dto.ts
│       │       └── express-interest.dto.ts
│       ├── events/
│       │   ├── events.module.ts
│       │   ├── events.controller.ts
│       │   ├── events.service.ts
│       │   └── dto/
│       │       ├── health-event.dto.ts
│       │       └── rsvp.dto.ts
│       └── care/
│           ├── care.module.ts
│           ├── care.controller.ts
│           ├── care.service.ts
│           └── dto/
│               ├── provider-search.dto.ts
│               └── pcp-change.dto.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/           # Generated by `prisma migrate dev`
├── Dockerfile
├── .env.example
├── nest-cli.json
├── tsconfig.json
└── package.json

mobile/                       # React Native / Expo front-end
├── app/                      # Expo Router file-based routing
│   ├── (auth)/
│   │   └── login.tsx
│   ├── (app)/
│   │   ├── _layout.tsx       # Bottom navigation shell
│   │   ├── home.tsx          # Plan overview
│   │   ├── dependents.tsx
│   │   ├── inbox.tsx
│   │   ├── marketplace.tsx
│   │   ├── events.tsx
│   │   └── care-finder.tsx
│   └── _layout.tsx           # Root layout + PaperProvider
├── src/
│   ├── api/                  # RTK Query service definitions
│   │   ├── apiClient.ts      # Axios base with token injection
│   │   ├── authApi.ts
│   │   ├── plansApi.ts
│   │   ├── dependentsApi.ts
│   │   ├── communicationsApi.ts
│   │   ├── marketplaceApi.ts
│   │   ├── eventsApi.ts
│   │   └── careApi.ts
│   ├── store/                # Zustand stores
│   │   ├── authStore.ts
│   │   └── tenantStore.ts
│   ├── theme/
│   │   └── theme.ts          # MD3 theme with tenant token overrides
│   ├── components/           # Shared RNP-based components
│   │   ├── DigitalIdCard.tsx
│   │   ├── PlanTierChip.tsx
│   │   ├── NetworkBadge.tsx
│   │   └── UnreadBadge.tsx
│   └── hooks/
│       ├── useAuth.ts
│       ├── useTenantConfig.ts
│       └── usePlanOverview.ts
├── app.json
├── tsconfig.json
└── package.json

docker-compose.yml            # Orchestrates api + mssql services
.env.example                  # Template — never committed with real values
```

**Structure Decision**: Mobile + API split. `api/` contains the NestJS back-end (runnable
in Docker). `mobile/` contains the Expo React Native application (runs outside Docker on the
developer's machine, connecting to the Dockerised API). Root-level `docker-compose.yml`
orchestrates only the back-end stack.

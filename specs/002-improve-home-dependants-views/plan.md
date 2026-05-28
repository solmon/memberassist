# Implementation Plan: Improve Home & Dependants Views

**Branch**: `002-improve-home-dependants-views` | **Date**: 2026-05-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-improve-home-dependants-views/spec.md`

## Summary

Improve the mobile app's Home screen and Dependants screen to display a simplified but complete subscription and dependants view, analogous to what the Hear2.0 Angular web portal shows—but scoped strictly to what a member needs to self-serve from a phone. The back-end delivers two new standalone REST endpoints (`GET /members/me/plan-summary` and `GET /members/me/dependants`) backed by three new Prisma schema fields (`planType`, `deductibleLimit`, `deductibleMet` on `PlanEnrollment`). The mobile front-end replaces the minimal card with a rich plan summary card and a proper dependants list with tap-through digital ID card views.

## Technical Context

**Language/Version**: TypeScript 5.x strict mode — both `api/` (NestJS) and `mobile/` (React Native / Expo SDK 52+). Node.js 22 LTS for the API.

**Primary Dependencies**:
- Back-End: `@nestjs/core`, `@nestjs/common`, `@nestjs/jwt`, `@prisma/client`, `class-validator`, `class-transformer`
- Front-End: `react-native-paper` (MD3), `zustand`, RTK Query (`@reduxjs/toolkit`), `expo-secure-store`, `expo-router`
- Infra: Docker Compose v2, MSSQL 2022 container

**Storage**: Microsoft SQL Server 2022 via Prisma ORM (`provider = "sqlserver"`). Three new nullable columns added to `PlanEnrollment`; no new tables.

**Testing**: Jest + `@nestjs/testing` for NestJS service/controller unit tests; Jest + React Native Testing Library for mobile component tests.

**Target Platform**: iOS 16+, Android 13+, Web (React Native Web via Expo). NestJS REST API running in Docker on Linux.

**Project Type**: Mobile + Web app (React Native / Expo) consuming a NestJS REST API (pnpm monorepo: `api/` + `mobile/`).

**Performance Goals**: `GET /members/me/plan-summary` and `GET /members/me/dependants` p95 response ≤ 500 ms. Home screen first-meaningful-paint ≤ 3 s on 4G. Dependants list renders within 1 s for up to 10 dependants.

**Constraints**: No PHI (SSN, Tax ID, full DOB, address) in API response payloads or UI. Tenant-scoped queries on every Prisma call. pnpm only — no npm/yarn. No `any` types.

**Scale/Scope**: 2 new API endpoints, 3 schema columns, 2 updated screens (~150–200 lines each), 1 updated API service hook (`usePlanOverview`), 1 new API hook (`useDependants`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|---|---|---|
| I — Architecture & Type Safety | TypeScript strict; Prisma sole ORM; no `any`; pnpm workspace | ✅ PASS — no new libraries; existing monorepo unchanged |
| II — UI Consistency | RNP components exclusively; `useTheme()` for all styling; no hardcoded hex | ✅ PASS — plan uses `Card`, `ProgressBar`, `List.Item`, `Chip`, `Surface` only |
| III — HIPAA Security & Privacy | PHI never in logs; no SSN/Tax ID/address/DOB in response DTOs; `expo-secure-store` for tokens | ✅ PASS — FR-007 and FR-012 explicitly prohibit PHI on screen; response DTOs exclude sensitive fields |
| IV — Code Quality & Precision | No TODOs; minimal focused changes; complete logic delivered | ✅ PASS — scope is two screens + two endpoints + three schema columns |
| V — Back-End & Database Patterns | NestJS Module/Controller/Service; DTOs with class-validator; `tenantId` on every model/query; explicit `@@index`; `NVarChar`/`DateTime2`; UUID PKs | ✅ PASS — new columns added to existing model with correct types; new endpoints follow Module/Controller/Service pattern |
| VI — Infrastructure & Local Dev | Docker Compose for API + MSSQL; pnpm in Dockerfile; `--frozen-lockfile` | ✅ PASS — no Dockerfile changes needed; migration runs via `prisma migrate dev` |

**Post-Design Re-check** (after Phase 1): All six principles remain satisfied. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/002-improve-home-dependants-views/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── plan-summary.md  # GET /members/me/plan-summary contract
│   └── dependants.md    # GET /members/me/dependants contract
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
api/
├── prisma/
│   └── schema.prisma                         # MODIFIED: + planType, deductibleLimit, deductibleMet
├── src/
│   └── modules/
│       └── members/
│           ├── members.module.ts             # MODIFIED — register new DTOs
│           ├── members.controller.ts         # MODIFIED — add /me/plan-summary + /me/dependants
│           ├── members.service.ts            # MODIFIED — implement plan-summary + dependants queries
│           └── dto/
│               ├── plan-summary.dto.ts       # NEW — response DTO for plan summary
│               └── dependant-list.dto.ts     # NEW — response DTO for dependants list

mobile/
├── app/
│   └── (app)/
│       ├── home.tsx                          # MODIFIED — richer plan card(s) + deductible row
│       └── dependents.tsx                    # MODIFIED — status badge + age + tap-through ID card
└── src/
    ├── api/
    │   ├── plansApi.ts                       # MODIFIED — add getPlanSummary()
    │   └── dependentsApi.ts                  # MODIFIED — align response shape
    ├── hooks/
    │   ├── usePlanOverview.ts                # MODIFIED — consume new fields
    │   └── useDependants.ts                  # NEW — hook for dependants list with card data
    └── types/
        ├── planSummary.ts                    # NEW — TypeScript types for plan-summary
        └── dependant.ts                      # NEW/MODIFIED — types for dependants
```

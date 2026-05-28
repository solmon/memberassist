# Quickstart: Improve Home & Dependants Views

**Branch**: `002-improve-home-dependants-views`

This guide covers running the database migration, seeding test data, testing the two new API endpoints, and verifying the updated mobile screens in the development environment.

---

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose v2) running
- `pnpm` ≥ 9.x installed
- Node.js 22 LTS
- VS Code with the Remote Containers or Prisma extension (optional but helpful)

---

## 1. Start the development environment

```bash
# From the monorepo root
docker compose up -d
```

Wait for the `api` service to show `Application is running on: http://[::1]:3000` in its log:

```bash
docker compose logs -f api
```

---

## 2. Run the database migration

The migration adds `planType`, `deductibleLimit`, and `deductibleMet` to `PlanEnrollment`.

```bash
pnpm --filter api prisma migrate dev --name add_plan_type_deductible
```

Expected output:

```
Applying migration `<timestamp>_add_plan_type_deductible`
The following migration(s) have been applied:
  migrations/<timestamp>_add_plan_type_deductible/migration.sql
```

If the migration fails due to the container not being ready, wait 10 seconds and retry. The MSSQL health check should prevent this, but the initial volume warm-up can add latency.

### Verify the migration

```bash
pnpm --filter api prisma studio
```

Open [http://localhost:5555](http://localhost:5555) and navigate to `PlanEnrollment`. Confirm the three new columns appear.

---

## 3. Seed test data

```bash
pnpm --filter api prisma db seed
```

The seed script (`api/prisma/seed.ts`) creates:
- A tenant `district-001`
- A member `jane.doe@example.com` / password `Password1!`
- Two active `PlanEnrollment` rows: one `MEDICAL` (with deductible), one `DENTAL` (no deductible)
- Two `Dependent` rows: one `SPOUSE` with a digital card, one `CHILD` without

> **Note**: After running the initial migration, update any existing seed rows with correct `planType` values if they were backfilled as `'MEDICAL'` and are actually dental/vision records.

---

## 4. Test the new API endpoints

### Obtain a JWT

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"jane.doe@example.com","password":"Password1!","tenantId":"district-001"}' \
  | jq '.access_token'
```

Copy the token value. Replace `<TOKEN>` in the commands below.

---

### Test `GET /members/me/plan-summary`

```bash
curl -s http://localhost:3000/members/me/plan-summary \
  -H 'Authorization: Bearer <TOKEN>' \
  | jq .
```

**Expected**: array of 2 enrollment objects — one `MEDICAL` with `deductibleLimit: 1500`, one `DENTAL` with `deductibleLimit: null`.

**Verify**:
- [ ] `planType` field present on each object
- [ ] `deductibleLimit` is `1500` on MEDICAL and `null` on DENTAL
- [ ] No `email`, `dateOfBirth`, `passwordHash` in response
- [ ] HTTP 200

**Test 401**:

```bash
curl -s http://localhost:3000/members/me/plan-summary | jq .statusCode
# Expected: 401
```

---

### Test `GET /members/me/dependants`

```bash
curl -s http://localhost:3000/members/me/dependants \
  -H 'Authorization: Bearer <TOKEN>' \
  | jq .
```

**Expected**: array of 2 dependant objects — one with `digitalCard` populated, one with `digitalCard: null`.

**Verify**:
- [ ] `coverageStatus` is `"ACTIVE"` for the dependant with a card
- [ ] `coverageStatus` is `"UNKNOWN"` for the dependant without a card
- [ ] `dateOfBirth` is present but raw date is used only for age calculation on the client — it is not rendered
- [ ] No `tenantId`, `memberId`, `passwordHash` in response
- [ ] HTTP 200

---

## 5. Run the API test suite

```bash
pnpm --filter api test
```

All existing tests should still pass. New tests for `getPlanSummary` and `getDependants` will be added during the implementation phase.

---

## 6. Run the mobile app

```bash
pnpm --filter mobile start
```

Then:
- Press `i` for iOS Simulator or `a` for Android Emulator, or scan the QR code with Expo Go.
- Log in with `jane.doe@example.com` / `Password1!`.

**Home screen**:
- [ ] Two plan summary cards visible: "Horizon Blue Cross Blue Shield" (MEDICAL) and "Delta Dental Premier" (DENTAL)
- [ ] MEDICAL card shows deductible progress bar: "$425 / $1,500"
- [ ] DENTAL card has **no** deductible row
- [ ] Both cards show status badge "Active"
- [ ] Renewal banner shown if `nextRenewalDate` is within 30 days

**Dependants screen**:
- [ ] Two dependants listed: Alex Doe (CHILD, Age 10) and Morgan Doe (SPOUSE, Age 37)
- [ ] Tapping Alex opens a digital card view with group number and plan name
- [ ] Tapping Morgan shows "Card not yet issued — contact your plan administrator"
- [ ] No raw `dateOfBirth` string visible anywhere in the UI

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `prisma migrate dev` fails: "Cannot connect to the database server" | Run `docker compose ps` — ensure `db` container is healthy. Retry after 10 s. |
| Seed fails: "Unique constraint failed on field 'email'" | Seed data already exists. Run `docker compose down -v && docker compose up -d` to reset the volume, then re-migrate and re-seed. |
| Mobile app shows "Network request failed" | Confirm `API_URL` in `mobile/.env` (or `mobile/app.json` extra config) points to `http://localhost:3000`. On Android emulator, use `http://10.0.2.2:3000`. |
| `deductibleLimit` shows as `"1500"` (string) in API response | The Prisma `Decimal` type is not auto-converted to number. Ensure the response DTO uses `@Transform(({ value }) => Number(value))` on decimal fields. |

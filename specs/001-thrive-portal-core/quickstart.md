# Developer Quick Start: Thrive Portal

**Branch**: `001-thrive-portal-core` | Updated: 2026-05-22

---

## Prerequisites

| Tool | Minimum Version | Notes |
|---|---|---|
| Docker Engine | 26+ | `docker --version` |
| Docker Compose | v2.x (plugin) | `docker compose version` |
| Node.js | 22 LTS | `node --version` |
| pnpm | 9+ | `npm install -g pnpm` (once only, to bootstrap) |
| Expo CLI | latest | `pnpm add -g expo-cli` |

---

## 1. Clone & Configure Environment

```bash
git clone <repo-url>
cd memberassist

# Install all workspace dependencies from the repo root
pnpm install

# Back-end environment
cp api/.env.example api/.env
```

Open `api/.env` and fill in the required values:

```env
# api/.env — DO NOT COMMIT THIS FILE
DATABASE_URL="sqlserver://localhost:1433;database=ThrivePortal;user=sa;password=<YOUR_SA_PASSWORD>;trustServerCertificate=true"
SHADOW_DATABASE_URL="sqlserver://localhost:1433;database=ThrivePortalShadow;user=sa;password=<YOUR_SA_PASSWORD>;trustServerCertificate=true"
MSSQL_SA_PASSWORD=<YOUR_SA_PASSWORD>   # must be ≥ 8 chars, upper + lower + number + special

JWT_SECRET=<random-32-char-string>
JWT_ACCESS_TTL=900                      # seconds (15 min)
JWT_REFRESH_TTL=2592000                 # seconds (30 days)

NODE_ENV=development
PORT=3000
```

> **Security note**: The SA password must meet MSSQL's complexity requirements:
> at least 8 characters, including uppercase, lowercase, digit, and a special character.
> Example generator: `openssl rand -base64 24`

---

## 2. Start the Back-End Stack

```bash
# Start MSSQL and NestJS API in Docker
docker compose up -d

# Watch API logs to confirm successful startup
docker compose logs -f api
```

Expected output (within ~30 seconds):

```
api  | [NestJS] Starting Prisma connection (attempt 1/10)...
api  | [NestJS] Database ready
api  | [NestJS] Application is running on: http://[::1]:3000
```

---

## 3. Run Database Migrations

```bash
# Apply all pending Prisma migrations (runs inside the api workspace)
pnpm --filter api exec prisma migrate dev
```

Prisma will connect to the MSSQL container and create the `ThrivePortal` database schema.
After first migration, you should see all tables created in MSSQL.

---

## 4. (Optional) Seed Development Data

```bash
pnpm --filter api exec prisma db seed
```

This inserts a sample tenant, one broker, and one member account:

| Field | Value |
|---|---|
| Tenant slug | `demo-health` |
| Member email | `jane.doe@example.com` |
| Password | `Password1!` |

---

## 5. Verify the API

```bash
# Health check
curl http://localhost:3000/health

# Login
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane.doe@example.com","password":"Password1!","tenantSlug":"demo-health"}'
```

Swagger UI (development only): [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 6. Start the Mobile App

```bash
# Start Expo development server (dependencies already installed via root pnpm install)
pnpm --filter mobile expo start
```

Press:
- `i` — open iOS Simulator (requires Xcode on macOS)
- `a` — open Android Emulator (requires Android Studio)
- `w` — open in browser (React Native Web)

The mobile app expects the API at `http://localhost:3000`. For physical device testing, update
`mobile/src/api/apiClient.ts` to point to your machine's LAN IP.

---

## Docker Compose Reference

```yaml
# docker-compose.yml (abbreviated — see full file in repo root)

services:
  mssql:
    image: mcr.microsoft.com/mssql/server:2022-CU12-ubuntu-22.04
    environment:
      ACCEPT_EULA: "Y"
      MSSQL_SA_PASSWORD: ${MSSQL_SA_PASSWORD}
    ports:
      - "1433:1433"
    healthcheck:
      test: >
        /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa
        -P "${MSSQL_SA_PASSWORD}" -Q "SELECT 1" -No -C
      interval: 10s
      timeout: 5s
      retries: 10

  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    env_file: ./api/.env
    depends_on:
      mssql:
        condition: service_healthy
```

---

## Dockerfile Reference (`api/Dockerfile`)

```dockerfile
FROM node:22-alpine3.20 AS builder
WORKDIR /app
# Install pnpm (pnpm is NOT pre-installed in the node image)
RUN npm install -g pnpm
# Copy workspace manifests and lockfile for reproducible install
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY api/package.json ./api/
RUN pnpm install --frozen-lockfile --filter api...
COPY api/ ./api/
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api run build

FROM node:22-alpine3.20
WORKDIR /app
COPY --from=builder /app/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/api/node_modules ./api/node_modules
COPY --from=builder /app/api/prisma ./prisma
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

---

## `.env.example` Reference (`api/.env.example`)

```env
DATABASE_URL="sqlserver://localhost:1433;database=ThrivePortal;user=sa;password=CHANGE_ME;trustServerCertificate=true"
SHADOW_DATABASE_URL="sqlserver://localhost:1433;database=ThrivePortalShadow;user=sa;password=CHANGE_ME;trustServerCertificate=true"
MSSQL_SA_PASSWORD=CHANGE_ME

JWT_SECRET=CHANGE_ME_32_CHARS_OR_MORE
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=2592000

NODE_ENV=development
PORT=3000
```

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| `api` container exits immediately | MSSQL not ready yet | `docker compose restart api` after `mssql` is healthy |
| `Login timeout expired` from Prisma | Wrong `DATABASE_URL` host | Use `mssql` (not `localhost`) in container-to-container URLs |
| `Password validation failed` | SA password doesn't meet complexity | Use ≥ 8 chars with upper/lower/digit/special |
| `Migration failed: shadow database` | Shadow DB doesn't exist | Run `CREATE DATABASE ThrivePortalShadow` via sqlcmd first, or use `--skip-seed` |
| Expo `Network request failed` | API URL points to `localhost` | Change to LAN IP of dev machine |

---

## Common Commands

```bash
# Reset the database (dev only — DESTROYS ALL DATA)
pnpm --filter api exec prisma migrate reset

# Generate Prisma client after schema changes
pnpm --filter api exec prisma generate

# Open Prisma Studio (visual DB browser)
pnpm --filter api exec prisma studio

# Install a new dependency in a specific workspace
pnpm --filter api add <package>
pnpm --filter mobile add <package>

# Stop all Docker services
docker compose down

# Stop and remove volumes (full reset including MSSQL data)
docker compose down -v
```

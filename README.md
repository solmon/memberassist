# Thrive Portal

A full-stack member benefits portal for public sector health plans.

- **API**: NestJS 11 + Prisma 7 + MSSQL 2022
- **Mobile**: React Native + Expo SDK 52 + React Native Paper

---

## Quick Start

### Prerequisites

- Node.js 24.x
- pnpm 11.x
- Docker & Docker Compose

### 1. Clone and install dependencies

```sh
git clone <repo-url> memberassist
cd memberassist
pnpm install
```

### 2. Configure environment

```sh
cp api/.env.example api/.env
# Edit api/.env with your values
```

### 3. Start the database

```sh
docker compose up db -d
# Wait for the database to become healthy (~30s)
```

### 4. Run database migrations and seed

```sh
cd api
pnpm prisma migrate deploy
pnpm prisma db seed
```

### 5. Start the API

```sh
# From repo root
pnpm start:api
# API available at http://localhost:3000
# Swagger docs at http://localhost:3000/api-docs
```

### 6. Start the mobile app

```sh
pnpm start:mobile
# Follow Expo CLI prompts to open in simulator or Expo Go
```

---

## Docker (full stack)

```sh
cp .env.example .env
# Edit .env with DB_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET
docker compose up --build
```

---

## Demo credentials

After seeding, log in with:

- **Email**: `jane.doe@example.com`
- **Password**: `Password1!`
- **Tenant slug**: `demo-health`

---

## Project structure

```
memberassist/
├── api/           # NestJS REST API
│   ├── prisma/    # Schema, migrations, seed
│   └── src/
│       └── modules/
│           ├── auth/
│           ├── care/
│           ├── communications/
│           ├── dependents/
│           ├── events/
│           ├── marketplace/
│           ├── members/
│           ├── plans/
│           └── tenants/
├── mobile/        # Expo React Native app
│   ├── app/       # Expo Router file-based routes
│   └── src/
│       ├── api/   # Axios API clients
│       ├── components/
│       ├── hooks/
│       └── store/ # Zustand stores
└── docker-compose.yml
```

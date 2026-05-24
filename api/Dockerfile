FROM node:22-alpine3.20 AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace manifests and lockfile for reproducible install
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY api/package.json ./api/

# Install only api workspace dependencies
RUN pnpm install --frozen-lockfile --filter api...

# Copy api source
COPY api/ ./api/

# Generate Prisma client and build
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api run build

# ─── Runner stage ───────────────────────────────────────────────
FROM node:22-alpine3.20
WORKDIR /app

# Install pnpm for runtime prisma commands
RUN npm install -g pnpm

COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/api/package.json ./api/
COPY --from=builder /app/api/dist ./api/dist
COPY --from=builder /app/api/prisma ./api/prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/api/node_modules ./api/node_modules

WORKDIR /app/api
EXPOSE 3000
CMD ["node", "dist/main.js"]

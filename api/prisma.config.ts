import { defineConfig } from 'prisma/config';

// Prisma 6 configuration — datasource url lives in schema.prisma
export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
    seed: 'ts-node ./prisma/seed.ts',
  },
});

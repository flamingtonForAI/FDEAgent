/**
 * Prisma seed script — creates demo account when DEMO_ENABLED=true
 *
 * Usage:
 *   DEMO_ENABLED=true npx tsx prisma/seed.ts
 *   — or —
 *   npm run db:seed  (reads DEMO_ENABLED from .env)
 */

import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'Demo123!';

async function main() {
  if (process.env.DEMO_ENABLED !== 'true') {
    console.log('DEMO_ENABLED is not true — skipping demo seed.');
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });

  if (existing) {
    console.log(`Demo account already exists (${DEMO_EMAIL}), skipping.`);
    return;
  }

  const passwordHash = await argon2.hash(DEMO_PASSWORD, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      passwordHash,
      emailVerified: true,
    },
  });

  console.log(`Demo account created: ${DEMO_EMAIL}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

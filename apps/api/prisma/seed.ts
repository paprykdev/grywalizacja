import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const links = [
  {
    id: 1,
    title: 'Installation',
    url: 'https://turborepo.dev/docs/getting-started/installation',
    description: 'Get started with Turborepo in a few moments using',
  },
  {
    id: 2,
    title: 'Crafting',
    url: 'https://turborepo.dev/docs/crafting-your-repository',
    description: 'Architecting a monorepo is a careful process.',
  },
  {
    id: 3,
    title: 'Add Repositories',
    url: 'https://turborepo.dev/docs/getting-started/add-to-existing-repository',
    description:
      'Turborepo can be incrementally adopted in any repository, single or multi-package, to speed up the developer and CI workflows of the repository.',
  },
];

async function main() {
  for (const { id, ...data } of links) {
    await prisma.link.upsert({ where: { id }, update: data, create: { id, ...data } });
  }
  // Explicit ids don't advance the autoincrement sequence
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Link"', 'id'), (SELECT MAX(id) FROM "Link"))`;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

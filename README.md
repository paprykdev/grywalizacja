# Grywalizacja

A Turborepo monorepo:

- **API:** NestJS + Prisma + PostgreSQL (Docker), with Swagger docs
- **Web:** Vite + React + React Router + TanStack Query + shadcn/ui

## Getting started

```bash
npm install

# 1. Configure env (used by Docker, Prisma and Nest) and set your own password
cp apps/api/.env.example apps/api/.env

# 2. Start Postgres
npm run db:up

# 3. Apply migrations and seed demo data
npm run db:migrate -w api
npm run db:seed -w api

# 4. Run the API (http://localhost:3000, Swagger at /docs) and web (http://localhost:3001)
npm run dev
```

The web app calls the API through the Vite dev proxy: `/api/*` → `http://localhost:3000/*`. Set `API_URL` to point it elsewhere.

For frontend conventions (folder structure, adding pages, components, queries and forms), see [`apps/web/README.md`](apps/web/README.md).

> [!NOTE]
> Postgres applies `POSTGRES_USER`/`POSTGRES_PASSWORD` only when the data volume is first created. To change them later, either run `ALTER USER ... PASSWORD '...'` in the database, or reset it with `docker compose --env-file apps/api/.env down -v`, which deletes all data. Keep `DATABASE_URL` in sync with the `POSTGRES_*` values.

### Database scripts

| Command                             | Description                                                                                         |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| `npm run db:up` / `npm run db:down` | Start / stop the Postgres container                                                                 |
| `npm run db:generate -w api`        | Generate the Prisma client into `apps/api/src/generated`. Runs automatically before build/dev/test. |
| `npm run db:migrate -w api`         | Create and apply a migration after editing `prisma/schema.prisma`                                   |
| `npm run db:deploy -w api`          | Apply pending migrations (CI/production)                                                            |
| `npm run db:seed -w api`            | Run `prisma/seed.ts`                                                                                |
| `npm run db:studio -w api`          | Open Prisma Studio                                                                                  |

## What's inside?

```shell
.
├── apps
│   ├── api                       # NestJS + Prisma (https://nestjs.com)
│   └── web                       # Vite + React + shadcn/ui (https://vite.dev)
└── packages
    ├── @repo/api                 # Shared DTOs/entities (API <-> web)
    ├── @repo/eslint-config       # ESLint configurations (includes Prettier)
    ├── @repo/jest-config         # Jest configurations (API)
    └── @repo/typescript-config   # tsconfig.json files used by the API and packages
```

### Commands

```bash
npm run build         # build all apps and packages
npm run dev           # dev servers (API + web)
npm run test          # unit tests (API: Jest, web: Vitest)
npm run test:e2e      # API e2e tests (requires the database: npm run db:up)
npm run lint
npm run check-types
npm run format        # Prettier
```

A Husky pre-commit hook runs Prettier on staged files through lint-staged.

## Useful links

- [Turborepo docs](https://turborepo.dev/docs)
- [NestJS](https://docs.nestjs.com), [Prisma](https://www.prisma.io/docs)
- [React Router](https://reactrouter.com), [TanStack Query](https://tanstack.com/query/latest), [shadcn/ui](https://ui.shadcn.com)

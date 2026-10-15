# CLAUDE.md

Turborepo monorepo (npm workspaces, Node >= 24): NestJS API + Prisma/PostgreSQL (Docker) and a Vite + React frontend.

## Layout

- `apps/api`: NestJS 12, compiled by **SWC** to CommonJS (`swc src -d dist`), not `nest build`
  - `prisma.config.ts`: Prisma 7 config. It loads `.env` via `dotenv/config` and holds the datasource URL plus the seed command.
  - `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts` (run with `tsx`)
  - `src/prisma/`: `PrismaModule` (`@Global`) and `PrismaService`. The service extends the generated `PrismaClient` with the `@prisma/adapter-pg` driver adapter and reads `DATABASE_URL` through `ConfigService`.
  - `src/generated/prisma/`: the **generated** client. It is gitignored and lint-ignored; never edit it. Import from `../generated/prisma/client`, **not** `@prisma/client`.
  - `src/links/`: the reference CRUD module (controller → service → `prisma.link.*`). Copy this pattern for new resources.
  - **Swagger** UI is at `/docs` (JSON at `/docs-json`). The plain SWC build does not run the Nest Swagger CLI plugin, so every DTO/entity field needs an explicit `@ApiProperty()`, and controllers declare `@ApiTags`/`@Api*Response({ type })`.
- `apps/web`: Vite 8 + React 19, dev server on port 3001. **`apps/web/README.md` is the team guide**: folder map and how to add a page, component, query or form.
  - Stack: React Router 8 (data mode, `src/app/router.tsx`), TanStack Query, react-hook-form + zod, shadcn/ui (Radix, Tailwind v4, `components.json`), next-themes for dark mode, sonner toasts, Vitest + Testing Library.
  - Structure: `src/app/` (router, providers, layouts), `src/components/ui/` (shadcn-generated; add with `npx shadcn@latest add <name>` from `apps/web`), `src/features/<name>/{api.ts,schemas.ts,components/,pages/}`, `src/pages/`, `src/lib/`. `features/links` is the reference feature.
  - The `@/` alias points to `src/`, and is configured in `tsconfig.json`, `tsconfig.app.json` and `vite.config.ts`. TS 7 has no `baseUrl`, so `paths` alone does the work.
  - All API calls go through `apiFetch` (`src/lib/api-client.ts`), wrapped in TanStack Query hooks in the feature's `api.ts`; there are no `fetch` calls in `useEffect`. The `MutationCache` in `providers.tsx` toasts every mutation error globally.
  - The dev proxy maps `/api/*` to `http://localhost:3000/*` (override with the `API_URL` env var). Never hard-code the API host.
  - It uses Vite's own `tsconfig.app.json`/`tsconfig.node.json` (bundler resolution, `verbatimModuleSyntax`, `erasableSyntaxOnly`, so no TS parameter properties or enums). The shared `@repo/typescript-config` (NodeNext) does not suit Vite.
  - shadcn's current registry uses the `cn` package (by shadcn, replacing clsx + tailwind-merge) and the `radix-ui` umbrella package. Both are expected.
- `packages/api` (`@repo/api`): DTOs and entities shared by the API and web.
  - DTOs carry `class-validator` and `@nestjs/swagger` decorators; the API's global `ValidationPipe` (`whitelist`, `transform`) enforces them. `UpdateLinkDto` uses `PartialType` from `@nestjs/swagger`.
  - The web app must use `import type` only, so that no Nest code reaches the bundle.
  - It must be **built** (`tsc`) before its consumers; Turbo's `^build` dependency handles that.
- `packages/eslint-config`, `packages/typescript-config`, `packages/jest-config`: shared configs. The Next.js variants and `packages/ui` were removed; UI components live in `apps/web` (shadcn).

## Commands (from the repo root)

```bash
cp apps/api/.env.example apps/api/.env   # one env file for Docker + Prisma + Nest
npm run db:up                            # docker compose --env-file apps/api/.env up -d --wait
npm run db:migrate -w api                # prisma migrate dev (after editing schema.prisma)
npm run db:seed -w api
npm run dev                              # api :3000 + web :3001
npm run build | check-types | lint | test # test = api Jest + web Vitest
npm run test:e2e                         # boots the full AppModule, so it needs the DB running
```

Other API scripts: `db:generate`, `db:deploy`, `db:studio`. Turbo runs `db:generate` automatically before `build`/`dev`/`check-types`/`test`.

## Conventions and gotchas

- Pin **exact** versions: `npm i -w <workspace> --save-exact <pkg>`. `shadcn add` installs packages with carets, so pin them afterwards.
- **Formatting:** Prettier (single quotes; `apps/web` adds `prettier-plugin-tailwindcss`). The Husky pre-commit hook runs `lint-staged` (Prettier only), and ESLint runs through `npm run lint`.
- **Git:** check that commits include _modified_ files, not only new ones. An earlier commit lost every edit to tracked files.
- **Prisma:** stay on 7.x. npm's `latest` tag for `prisma` currently points to an 8.0 release candidate, so pin the version explicitly, and keep `prisma` and `@prisma/client` on the same version.
- The generated Prisma client uses `.js` import extensions. Jest handles them with a `moduleNameMapper`, set in `packages/jest-config/src/nest.ts` and `apps/api/test/jest-e2e.json`.
- Unit tests mock the database: `{ provide: PrismaService, useValue: {...} }`.
- `apps/api/tsconfig.build.json` has `include: ["src"]`, so `check-types` skips `prisma.config.ts` and `prisma/seed.ts`.
- **Env vars:** add new ones to `globalEnv` in `turbo.json`, otherwise the `turbo/no-undeclared-env-vars` lint rule warns. `.env` files are gitignored; keep `apps/api/.env.example` up to date.
- **Docker DB:** `postgres:18-alpine`, with the volume at `/var/lib/postgresql` (the Postgres 18 path). The host port comes from `POSTGRES_PORT`. `POSTGRES_PASSWORD` only applies when the volume is first created. To change it, use `ALTER USER`, or `down -v` (this wipes the data). `DATABASE_URL` must match the `POSTGRES_*` values.
- **Controllers:** import DTOs as values, not `import type`, so `ValidationPipe` sees their metadata. Parse ids with `ParseIntPipe`. Services throw `NotFoundException` when a record is missing.

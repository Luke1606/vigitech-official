## Vigitech — Copilot instructions for code-editing agents

This repository contains two primary components:

- `client/` — React + TypeScript + Vite front-end. See `client/package.json` for dev/build scripts.
- `radar-api/` — NestJS backend API (TypeScript + Prisma). See `radar-api/package.json` for scripts and DB workflows.

Keep guidance concise and specific to this codebase. Prefer minimal, safe edits and add tests where you change behavior.

Quick orientation
- Front-end entry: `client/src/main.tsx`, UI components under `client/src/ui/`, and visualization code in `client/src/assets/radar/`.
- Back-end entry: `radar-api/src/main.ts`, modules under `radar-api/src/modules/`, Prisma schema in `radar-api/prisma/schema.prisma`.

Build & dev workflows (explicit)
- Front-end:
  - Install and run dev server: open `client/` and run `npm install` then `npm run dev` (uses Vite).
  - Production build: `npm run build` in `client/` (runs `tsc -b && vite build`).
  - Lint: `npm run lint` in `client/`.
- Back-end:
  - Install and run dev server: open `radar-api/` and run `npm install` then `npm run start:dev`.
  - Full local dev stack (DB + migrations): `npm run dev:full` (starts DB via docker-compose, runs Prisma migrations, then starts Nest in watch mode).
  - Common DB helpers: `npm run db:up`, `npm run db:down`, `npm run db:migrate:dev`, `npm run db:reset`, `npm run db:seed`, `npm run db:studio`.
  - Tests: `npm run test` (unit) and `npm run test:e2e` (e2e). CI uses `test:with-db` / `test:ci` which bring up a test DB via `docker-compose.test.yml`.

Patterns & conventions to respect
- Typescript project uses path aliases and `tsconfig` project builds in `client/` and `radar-api/` — preserve import paths and update `tsconfig.*.json` only when necessary.
- Backend uses NestJS modules and providers (look for files under `radar-api/src/modules/*`). Follow existing DI patterns when adding services/controllers.
- Database uses Prisma (`radar-api/prisma/schema.prisma`) — prefer migrations via `prisma migrate` and `npm run db:generate` when updating the schema. Do not modify DB containers manually in PRs; use migration scripts.

Code-change guidance (safe, actionable rules)
- Small fixes: target a single file, run affected unit tests in `radar-api/` or start the front-end dev server to smoke-test UI changes.
- New endpoints: add controller, service, DTOs and tests. Register new module in `radar-api/src/app.module.ts` if needed.
- Front-end UI changes: prefer editing components under `client/src/ui/components/`. Keep styles in `client/src/global.css` or component-level CSS modules.
- API clients in the front-end use Axios configured in `client/src/infrastructure/lib/AxiosConfiguredInstance.util.ts` — re-use that instance for consistent base URLs and interceptors.

Where to look for examples
- Authentication: search for `@clerk` usage in both `client/` and `radar-api/`.
- Redux + React Query patterns: `client/src/infrastructure/redux/` and `client/src/infrastructure/lib/queryClient.ts`.
- Radar visualization: `client/src/assets/radar/radar_visualization.js` and helpers in the same folder.

Testing & verification
- After backend changes run `npm run test` in `radar-api/`. For DB-dependent tests use `npm run test:with-db` or the test DB compose file.
- After front-end UI changes run `npm run dev` and open the Vite server (default printed port) to verify rendering.

Pull request guidance for AI-generated changes
- Keep PRs small and focused (single feature/bug). Add or update tests where behavior changes.
- If adding DB migrations include the generated migration files under `radar-api/prisma/migrations/` and update any seed scripts if necessary.

If something is missing
- If you cannot find where a behavior is implemented, search for keywords across `client/src/` and `radar-api/src/` before introducing new top-level patterns. Ask for maintainers if a cross-cutting change is required.

Files referenced above are safe authoritative examples — use them when showing code snippets in PRs.

If this file should be expanded or tuned for other agents, request maintainers to add examples of CI, secrets management, or deployment steps.

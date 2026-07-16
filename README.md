# portifolio_gabriel

Personal portfolio and blog, built as a production-grade project: typed content pipeline, real database, authentication, tests and CI.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19
- [Tailwind CSS v4](https://tailwindcss.com)
- [velite](https://velite.js.org) — typed MDX/YAML content, validated by schema at build time
- [Drizzle ORM](https://orm.drizzle.team) + [Neon](https://neon.tech) Postgres
- [Better Auth](https://better-auth.com) — email/password plus optional GitHub and Google OAuth
- [Shiki](https://shiki.style) for syntax highlighting, [Mermaid](https://mermaid.js.org) for diagrams
- [Zod](https://zod.dev) for runtime validation (env, forms, API input)
- Monorepo: pnpm workspaces + [Turborepo](https://turborepo.com)
- Tests: [Vitest](https://vitest.dev) (unit) + [Playwright](https://playwright.dev) (e2e)
- CI: GitHub Actions (lint, typecheck, unit tests, build and e2e on every PR)

## Monorepo layout

```
apps/
  web/          Next.js app (routes, content, auth, e2e specs)
packages/
  ui/           Shared React components (Radix + Tailwind)
  db/           Drizzle schema and client for Neon Postgres
  config/       Shared ESLint and TypeScript configs
```

`packages/db` re-exports the Drizzle query operators (`eq`, `and`, `desc`, ...). Consumers must import them from `@gabriel/db`, not from their own `drizzle-orm` copy — pnpm peer variants produce nominally incompatible types.

## Getting started

Requirements: Node >= 22 (see `.nvmrc`) and pnpm 10 (pinned via `packageManager`).

```sh
pnpm install
cp apps/web/.env.example apps/web/.env.local   # then fill in the values
pnpm dev
```

## Scripts

Root (all run through Turborepo):

| Script           | What it does                         |
| ---------------- | ------------------------------------ |
| `pnpm dev`       | Dev server with velite in watch mode |
| `pnpm build`     | Production build (velite + next)     |
| `pnpm lint`      | ESLint across all workspaces         |
| `pnpm typecheck` | `tsc --noEmit` across all workspaces |
| `pnpm test`      | Vitest unit tests                    |
| `pnpm format`    | Prettier over the whole repo         |

`apps/web` (run with `pnpm --filter web <script>`):

| Script        | What it does                                                                         |
| ------------- | ------------------------------------------------------------------------------------ |
| `test:e2e`    | Playwright e2e tests; specs that hit the database are skipped unless `E2E_WITH_DB=1` |
| `db:generate` | Generate Drizzle migrations from the schema                                          |
| `db:migrate`  | Apply pending migrations                                                             |
| `db:studio`   | Open Drizzle Studio                                                                  |

## Environment variables

Declared and validated in `apps/web/lib/env.ts` (the app fails fast on a missing or malformed value). See `apps/web/.env.example`.

| Variable               | Required | Description                                                 |
| ---------------------- | -------- | ----------------------------------------------------------- |
| `DATABASE_URL`         | yes      | Neon Postgres connection string                             |
| `BETTER_AUTH_SECRET`   | yes      | Secret used by Better Auth to sign sessions (min. 32 chars) |
| `BETTER_AUTH_URL`      | no       | Public base URL of the app, used for auth callbacks         |
| `GITHUB_CLIENT_ID`     | no       | GitHub OAuth app client ID; enables "Sign in with GitHub"   |
| `GITHUB_CLIENT_SECRET` | no       | GitHub OAuth app client secret (required with the ID)       |
| `GOOGLE_CLIENT_ID`     | no       | Google OAuth client ID; enables "Sign in with Google"       |
| `GOOGLE_CLIENT_SECRET` | no       | Google OAuth client secret (required with the ID)           |

## Content

Posts and case studies live in `apps/web/content` as MDX (projects as YAML). Every file is validated against a velite schema at build time — a bad frontmatter field, a duplicate series part or a dangling project reference fails the build instead of shipping broken pages.

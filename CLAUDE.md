# money-manager

Next.js App Router app (Next 15, yarn 1), NextAuth with Google only, Prisma on
Postgres. Background docs live in `docs/` (`architecture.md`, `auth.md`,
`folder-structure.md`; the last describes a planned layout, not the current
tree). Session logs are in `docs/progress/`.

The checks are `yarn validate` (lint, Prettier, `tsc`), `yarn test` and
`yarn build`. `yarn test` is Vitest (`vitest.config.mts`, tests in
`src/tests/**/*.test.ts`). Tests never touch a database:
`src/tests/setup.ts` points `DATABASE_URL` and `DIRECT_URL` at an unresolvable
host before anything loads (Prisma's generated client reads `.env` on import,
which would otherwise hand it production) and mocks `@/lib/db` with a client
that throws; a test of a helper that takes the client as a parameter passes its
own `vi.fn()` fake, as `src/tests/lib/transactions/balance.test.ts` does, and a
test of code that imports `db` directly (`src/lib/queries/`, API routes) needs
its own `vi.mock('@/lib/db', …)`. CI
(`.github/workflows/code-quality.yml`, the job named `quality`, on pushes to
`master` and PRs into it, Node from `.nvmrc`: 22, matching Vercel's `22.x`) runs
the frozen install, `tsc`, lint, Prettier, the tests and `yarn build` (with
placeholder env values and no secrets; the build opens no database connection).
`quality` is a required check on `master`, with branches required to be up to
date (`gh pr update-branch <n>` for one that is behind). A push to a branch
without a PR runs no CI, and neither does retargeting a PR to `master`: push a
commit, or close and reopen it, to get a run. Vercel (project
`money-manager`) deploys a preview for each PR and comments on it.
Dependabot (`.github/dependabot.yml`) opens grouped npm minor and patch updates
weekly and GitHub Actions updates monthly, each held back by a cooldown after
release; npm majors are ignored there and done by hand. Security updates are a
repository setting (on since 2026-11-12) and skip the schedule, the cooldown
and that major ignore: the first run (2026-11-12, right after the config
merged, not on the Monday) opened zod 3 → 4 as a security update.
Bring a Dependabot PR that is behind up to date with an `@dependabot rebase`
comment, not `gh pr update-branch`: Dependabot stops rebasing a PR once someone
else pushes to it. Its PRs come from branches in this repository, so Vercel
builds their previews with the project's variables, today the production
database. `.env` is git-ignored and there is no `.env.example`; the variables
are listed in `README.md`.

Worktrees live inside the main checkout (`.claude/worktrees/`), so tools that
search parent folders find the main checkout's files. The pre-commit hook's
`lint-staged` commands start with `yarn` for this reason: without it,
lint-staged runs the main checkout's ESLint, and the `@rushstack/eslint-patch`
that `eslint-config-next` loads fails with "the calling module was not
recognized". Don't add `package.json` scripts named `eslint` or `prettier`:
`yarn` would run the script instead of the tool.

A worktree's generated Prisma client (`src/generated/prisma`, git-ignored) is
built when the worktree is installed and can lag the schema; `tsc` then fails on
fields the schema has. `yarn prisma generate` rebuilds it from
`prisma/schema.prisma` without connecting to the database.

**There is one database, and it is production.** Vercel's `DATABASE_URL` and
`DIRECT_URL` (a Prisma Postgres database named `dev`, despite the name) apply
to production, preview and development alike, and a local `.env` holds the
same values (confirmed 2026-11-10). So every local run writes to production:
never run `prisma migrate reset` or accept the reset `prisma migrate dev`
offers on a branch missing applied migrations, apply migrations with
`yarn prisma migrate deploy`, and delete smoke-test accounts and transactions
when done.

## Goal and scope

The goal is weekly use by Vlad and their partner, not a first paying user
(decided 2026-11-11): `docs/family-plan.md` holds the decisions, the success
test and the milestones. The scope rule (the current family milestone, in that
plan's order; the question before any task is "does it block the family
trial?") is the `scope` line of `.claude/workflow.json`. Release is considered
only after the trial passes.

`docs/roadmap.md` and `docs/simplified-roadmap.md` are superseded and
overclaim: recipes, planned purchases, the goods database and analytics are
marked done but do not exist. `docs/data-models.md` and `architecture.md`
describe a household model that was never built; the household spec (plan,
issue 5) replaces them.

## Code map

Paths are relative to the repository root.

**Auth and route protection**

- `src/lib/auth.ts`: `authConfig` (Google provider, reads `GOOGLE_CLIENT_*`)
  and `getAuthSession()`, the one session helper → `src/app/api/auth/[...nextauth]/route.ts`
  → sign-in page `src/app/auth/signin/page.tsx`. `getAuthSession()` returns
  `null` for a session without `user.id`, because owner filters use it and
  Prisma reads `userId: undefined` as no filter.
- Redirect targets from user input go through `toSafeCallbackPath()`
  (`src/lib/callback-url.ts`), which keeps only same-origin paths; the sign-in
  page uses it for `callbackUrl`.
- Protection is per route, by decision, with no middleware
  (`docs/superpowers/specs/2026-11-10-auth-guards-design.md`): every
  `src/app/api/**/route.ts` calls `getAuthSession()` and returns 401 itself;
  server pages call it too. Signed out: `/accounts`, `/transactions`,
  `/transactions/[id]` and the edit pages and modals → `redirect('/auth/signin')`; `/dashboard` →
  `redirect('/')`; `/accounts/[id]` → `notFound()`; `/accounts/new` and
  `/transactions/new` (and their modals) have no check, their APIs 401.
  Server widgets in `src/components/dashboard/widgets/` call it too.
- A middleware would have to live in `src/middleware.ts` (a root
  `middleware.ts` is never compiled with `src/app`) and needs next-auth ≥
  4.24.15 first; see `docs/auth.md`.

**Data**

- `prisma/schema.prisma` (`DATABASE_URL`, `DIRECT_URL`) → client generated by
  `postinstall` into `src/generated/prisma` (git-ignored) → `src/lib/db.ts`
  (`db`) → queries in `src/lib/queries/`, input schemas in
  `src/lib/validators/`. Account balances are recomputed from transactions in
  `src/lib/transactions/balance.ts`, called by both transaction route files:
  `balance = openingBalance + Σ income − Σ expense`, rounded to cents. Any
  write that derives one of the two columns from the transaction sums (the
  recompute, `PUT /api/accounts/[id]` with a balance) calls
  `lockAccountForBalanceWrite()` first, inside `db.$transaction`.

**Modals**

- Intercepting-route modals are parallel slots at the `src/app` root:
  `src/app/@newAccountModal/`, `src/app/@editAccountModal/`,
  `src/app/@newTransactionModal/`, `src/app/@editTransactionModal/` (see
  `docs/intercepting-routes.md`). Forms are in `src/components/accounts/` and
  `src/components/transactions/`; mutations in `src/hooks/useAccounts.ts` and
  `src/hooks/useTransactions.ts`.

**Config**

- `next.config.ts`: image hosts only, no `experimental` flags.
- `.github/dependabot.yml`: npm and GitHub Actions updates; Dependabot alerts
  and security updates are repository settings, not in the file.
- There is no `vercel.json`: Vercel's build settings, including whatever
  cancels previews of CI- and docs-only PRs, live in the Vercel dashboard.

# money-manager

Next.js App Router app (Next 15, yarn 1), NextAuth with Google only, Prisma on
Postgres. Background docs live in `docs/` (`architecture.md`, `auth.md`,
`folder-structure.md`; the last describes a planned layout, not the current
tree). Session logs are in `docs/progress/`, dated decision records in
`docs/decisions/`.

The checks are `yarn validate` (lint, Prettier, `tsc`), `yarn test` and
`yarn build`. `yarn test` is Vitest (`vitest.config.mts`, tests in
`src/tests/**/*.test.ts`). Tests never touch a database:
`src/tests/setup.ts` points `DATABASE_URL` and `DIRECT_URL` at an unresolvable
host before anything loads (Prisma's generated client reads `.env` on import,
which would otherwise hand it `nonprod`, the database every preview shares)
and mocks `@/lib/db` with a client that throws; a test of a helper that takes the client as a parameter passes its
own `vi.fn()` fake, as `src/tests/lib/transactions/balance.test.ts` does, and a
test of code that imports `db` directly (`src/lib/queries/`, API routes) needs
its own `vi.mock('@/lib/db', …)`, plus one of `@/lib/auth` for the session, as
`src/tests/api/accounts.route.test.ts` does. CI
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
builds their previews with the project's Preview variables: the `nonprod`
database and a non-production `NEXTAUTH_SECRET`, but production's Google
client (parked).
`.env` is git-ignored and there is no `.env.example`; the variables are listed
in `README.md`.

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

**Two databases: `prod` and `nonprod`** (Prisma Postgres, project
`money-manager`, Frankfurt; since 2026-11-14). `prod` (named `dev` until that
day) backs only Vercel's Production environment. `nonprod` backs Preview,
Vercel's Development environment and local runs: the main checkout's `.env`
points at it, and worktrees link to that file. Vercel holds `DATABASE_URL` and
`DIRECT_URL` once per environment, six variables, all sensitive, so they
cannot be read back; locally both hold the same direct connection string.

`nonprod` is shared by every worktree and every preview: a migration applied
there from one branch changes the schema under the others. Resetting it is
allowed but signs everyone out of it (see the token trap below); say so first.

`yarn prisma migrate deploy` from a local run applies migrations to `nonprod`
only. The build runs no migrations, so a migration reaches production only
when Vlad runs it by hand, before merging the PR whose code needs it. Until
that deploy lands, the old code runs against the new schema, so the migration
must work with both (add columns and tables; drop or rename in a later PR).
The steps, in a terminal of Vlad's own:

1. Create a connection string for `prod` in the Prisma console.
2. In a subshell (zsh syntax), so nothing outlives it or reaches the shell
   history:
   `( read -rs 'U?prod URL: '; export DATABASE_URL=$U DIRECT_URL=$U; yarn prisma migrate status && yarn prisma migrate deploy )`.
   Variables already set win over `.env` (checked 2026-11-14), and both
   databases report the same host, so check that `migrate status` lists the
   pending migrations you expect before the deploy runs.
3. Delete that connection string in the Prisma console.

Never run `prisma migrate reset` or `prisma migrate dev` against `prod`.

Backups are Prisma's own (Starter plan since 2026-11-15); there is no backup
job in the repository. `docs/backups.md` has the restore drill (passed
2026-11-15), `scripts/count-rows.cjs` for comparing a restored copy with
`prod`, and the traps: the Prisma connector needs a console approval for every
write and SQL query, and its `execute_sql_query` answers "Database not found"
for these databases, so counts run locally.

Sessions are JWTs, decoded with `NEXTAUTH_SECRET` and trusted without a
database lookup. Production has its own secret; Preview, Development and the
local `.env` share another (both rotated 2026-11-14, after previews had held
production's: code in a preview build could have forged production sessions).
Switching the local `.env` to another database keeps the old cookie valid. After pointing `.env` at a different database, sign out and
back in: until then the user ID in the token does not exist there, so creating
an account fails with a 500 (Prisma P2003 on `FinancialAccount_userId_fkey`,
observed 2026-11-14) and other writes answer 404. Preview deployments cannot
sign in at all (Google's redirect list has no preview URLs;
`docs/decisions/2026-11-14-preview-sign-in.md`).

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

- `src/lib/auth.ts`: `authConfig` (Google provider, reads `GOOGLE_CLIENT_*`;
  JWT sessions, with `PrismaAdapter` storing users and OAuth accounts) and
  `getAuthSession()`, the one session helper → `src/app/api/auth/[...nextauth]/route.ts`
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
  `middleware.ts` is never compiled with `src/app`); see `docs/auth.md`.
  next-auth is on 4.24.15, the version the middleware needed first.

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
- Smoke-test writes go through the API from a signed-in page:
  `POST /api/accounts` and `POST /api/transactions` take the bodies in
  `src/lib/validators/account.validator.ts` and `transaction.validator.ts`.
  `DELETE /api/accounts/[id]` answers 409 while the balance is not zero, so
  cleanup deletes the transactions, then `PUT`s `{ id, balance: 0 }`, then
  deletes the account.

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
- `package.json` `resolutions` forces Next's PostCSS to 8.5.32: every Next 15
  and Next 16.0–16.2 pin 8.4.31 exactly, which carries security alerts
  (2026-11-14). Next 16.3 is the first to pin a fixed one (8.5.23); drop the
  resolution only when moving to 16.3 or later.
- There is no `vercel.json`: Vercel's build settings live in the dashboard.
  Its Ignored Build Step skips any build whose diff since the last deployed
  commit touches only `*.md`, `docs/` and `.claude/` (`git diff --quiet
${VERCEL_GIT_PREVIOUS_SHA:-HEAD^} HEAD -- . ':(exclude)*.md' …`). So a
  Redeploy of the same commit is always cancelled (observed 2026-11-14), and a
  changed environment variable reaches production only with the next merge
  that touches other files, or a redeploy with that step cleared.

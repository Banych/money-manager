# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **Yarn 1** (see `packageManager` in package.json). Use `yarn`, not `npm`.

- `yarn dev` — Next.js dev server with Turbopack
- `yarn build` / `yarn start` — production build / serve
- `yarn lint` / `yarn lint:fix` — ESLint
- `yarn format` / `yarn format:check` — Prettier
- `yarn type-check` — `tsc --noEmit`
- `yarn validate` — lint + format:check + type-check (run before pushing)
- `yarn postinstall` — runs `prisma generate` automatically. After editing `prisma/schema.prisma`, run `npx prisma generate` (and `npx prisma migrate dev` for schema changes).

Husky pre-commit runs `lint-staged` (eslint --fix + prettier --write on staged JS/TS; prettier on json/css/md). There is no test suite yet.

## Architecture

Next.js 15 App Router + React 19, Prisma + PostgreSQL (Supabase), NextAuth.js (Google provider), TanStack Query on the client, shadcn/ui (Radix) + Tailwind 4, React Hook Form + Zod.

### Prisma client lives in a non-standard location

The Prisma generator outputs to **`src/generated/prisma`** (configured in `prisma/schema.prisma`). Always import the singleton from [src/lib/db.ts](src/lib/db.ts):

```ts
import { db } from '@/lib/db';
```

Do not import `PrismaClient` directly elsewhere or instantiate it ad-hoc — `db.ts` reuses one instance across hot reloads in dev. `src/generated/prisma` is gitignored-style generated output; don't hand-edit it.

### Domain model (see [prisma/schema.prisma](prisma/schema.prisma))

- `User` ↔ NextAuth `Account`/`Session` (OAuth join tables; do **not** confuse `Account` with `FinancialAccount`).
- `FinancialAccount` (CASH/BANK_ACCOUNT/CREDIT_CARD/INVESTMENT/PREPAID) holds `balance`, `currency`, `lastActivity`.
- `Transaction` (INCOME/EXPENSE) belongs to both a `FinancialAccount` and a `User`. Indexed on `[accountId, date]` and `[userId, date]`.

When mutating transactions, balance bookkeeping for the related `FinancialAccount` is handled in [src/lib/transactions/balance.ts](src/lib/transactions/balance.ts) — reuse it rather than reinventing balance math.

### Routing layout

App Router under [src/app](src/app/). The app makes heavy use of **parallel routes + intercepting routes** for modals:

- Slot directories like `@newAccountModal`, `@newTransactionModal`, `@editAccountModal`, `@editTransactionModal` sit at the root layout level.
- Each slot has a `default.tsx` (renders nothing) and a `(.)<segment>/page.tsx` that intercepts navigation to the corresponding full page (e.g., `@newTransactionModal/(.)transactions/new/page.tsx` intercepts `/transactions/new`).
- This means every "new/edit" feature exists in **two places**: the standalone page (`/transactions/new`) and the intercepted modal version. Keep them in sync. See [docs/intercepting-routes.md](docs/intercepting-routes.md).

### Key API endpoints

- `GET/POST /api/accounts`, `GET/PUT/DELETE /api/accounts/:id`
- `GET /api/accounts/:id/transactions` — paginated list
- `GET /api/accounts/:id/statistics` — unified stats (replaces removed `/stats` & `/insights`)
- `GET/POST /api/transactions`, `GET/PUT/DELETE /api/transactions/:id`

Zod validators for these live in [src/lib/validators](src/lib/validators/) (e.g., `transaction.validator.ts`, `transaction.query.validator.ts`); query helpers in [src/lib/queries](src/lib/queries/).

### Dates: use the centralized helpers

All date/time rendering must go through [src/lib/date.ts](src/lib/date.ts) (`formatISO`, `formatDateTime`, `formatRelative`, `formatShort`, `daysAgo`). **Do not call `toLocaleDateString` / `toLocaleString` directly** in UI code — it caused SSR/CSR hydration mismatches. APIs return ISO strings; format only at the presentation layer. See [docs/date-formatting.md](docs/date-formatting.md).

### Path alias

`@/*` → `./src/*` (configured in `tsconfig.json`).

## Conventions

- Prettier config: no semicolons, single quotes, 2-space indent, LF endings.
- ESLint enforces `no-console` as error — use it deliberately or remove before commit.
- Generated Prisma output (`src/generated/**`) is excluded from lint/format.
- Further design/architecture context lives in [docs/](docs/) (architecture, data-models, api-documentation, ui-design, roadmap, etc.).

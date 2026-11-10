# Keep an account's starting balance when transactions change

Date: 2026-11-10. Status: draft for Vlad's approval. Option chosen by Vlad
on 2026-11-10: a stored opening-balance column ("option A"), over an
opening-balance transaction and over incremental balance updates.

## Why

`recomputeAccountBalance()` (`src/lib/transactions/balance.ts`) sets
`FinancialAccount.balance = income − expense` over the account's
transactions. The starting balance typed into the new-account form is
stored only in `balance`, so the first transaction create, edit or delete
overwrites it.

Observed 2026-11-10 against a fresh Prisma Postgres dev database: create a
cash account with €100, add a €20 expense → `GET /api/accounts` returns
`"balance": -20` (expected 80). Knock-on: the edit-account form then
refuses even a rename, because the update validator rejects a negative
balance on a cash account and the form always sends `balance` and `type`.

The same loss shows in the 7-day balance chart:
`GET /api/accounts/[id]/statistics` starts its running total at
`priorIncome − priorExpense`, so a €100 account with no older transactions
charts from 0.

## Goals

1. A new column `FinancialAccount.openingBalance` holds the amount the
   account had before any recorded transaction.
2. `balance` is always `openingBalance + Σ income − Σ expense` after any
   write that goes through the API.
3. The repro above gives €80; renaming that account then succeeds.
4. The 7-day chart includes the opening balance.
5. Existing rows get a migration that keeps every balance that is still
   correct today.

## Non-goals

- Recovering starting balances already overwritten in existing data. The
  value is stored nowhere, so it cannot be recovered. Those accounts get
  `openingBalance = 0`; their owner fixes them by setting "Current
  Balance" once in the edit form (behaviour 3 below).
- Showing the opening balance anywhere in the UI.
- Changing money from `Float` to a decimal type. `balance` is `Float`
  today, and the new column matches it.
- Adding a test framework. The repo has none; `yarn validate`, `yarn
build` and the repro against a dev database are the checks (the
  premise: no test runner exists. If one is added, this fix's recompute
  rule is the first thing worth a unit test).
- Currency conversion when an account's currency is edited.
- The update validator only checks for a negative cash or prepaid balance
  when the request carries both `balance` and `type`. That gap predates
  this bug and is left alone (recorded as a follow-up).

## Anti-goals

- No synthetic transactions. The transaction list, filters and monthly
  income/expense totals must not change because of this fix.
- No path that writes `balance` without keeping goal 2 true.

## Behaviour

Worked example used throughout: cash account created with €100; add a €20
expense; edit the account and set Current Balance to €75; delete the €20
expense.

| Step                        | openingBalance | balance |
| --------------------------- | -------------- | ------- |
| Create with €100            | 100            | 100     |
| Add €20 expense             | 100            | 80      |
| Edit, Current Balance = €75 | 95             | 75      |
| Delete the €20 expense      | 95             | 95      |

1. **Create account** (`POST /api/accounts`): the submitted `balance` is
   stored as both `openingBalance` and `balance`. The request body and
   validator are unchanged; clients never send `openingBalance`.
2. **Create, edit or delete a transaction** (`POST /api/transactions`,
   `PUT` and `DELETE /api/transactions/[id]`): the existing call to
   `recomputeAccountBalance()` now sets
   `balance = openingBalance + income − expense`. The call sites don't
   change. A transaction edit cannot move it to another account, so one
   recompute per write stays enough.
3. **Edit account with a balance** (`PUT /api/accounts/[id]`): the edit
   form's field is labelled "Current Balance", so a submitted `balance`
   means "the account holds this now". The route stores
   `openingBalance = submitted balance − (income − expense)` and
   `balance = submitted balance`. It reads the transaction sums and writes
   the account inside one `db.$transaction`, so a transaction written at
   the same moment cannot leave the two out of step.
   An edit without `balance` (a rename, say) leaves both columns alone.
4. **7-day chart** (`GET /api/accounts/[id]/statistics`): the running
   total starts at `openingBalance + priorIncome − priorExpense`.
5. **API responses**: `openingBalance` appears in account JSON because
   the routes return whole rows. The `Account` type in
   `src/hooks/useAccounts.ts` gains the field.
6. **Delete account**: unchanged; it still requires `balance === 0`.

7. **Edit form sends the balance only when it was changed** (my call,
   from the builder check): `edit-account-form.tsx` always sends
   `balance` today. A rename from a form opened before a transaction was
   added elsewhere would then reset the balance to the stale value
   shown. The form omits `balance` unless the user changed that field,
   so a rename takes the "edit without `balance`" path. Cheap to revisit.
8. **Rounding to cents** (my call, from the builder check): the stored
   `balance` and the derived `openingBalance` are rounded to 2 decimal
   places where they are computed. Without it, `submitted − net` and
   `opening + net` in floating point can leave a remainder such as
   1e-15, and delete-account's `balance === 0` check would refuse an
   account that shows €0.00. The form's step is already 0.01. Cost: a
   currency with 3 decimals would lose the third; none is offered today.

The income-minus-expense sum is used by the recompute and by behaviour 3.
It lives in one helper in `src/lib/transactions/balance.ts`, not in two
copies, and so does the rounding.

## Migration

One Prisma migration (`prisma migrate dev --create-only`, then edited by
hand) that:

1. Adds `"openingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0` to
   `"FinancialAccount"`.
2. Backfills every row:
   `openingBalance = balance − (Σ income − Σ expense)` over that account's
   transactions (0 for an account with none).

What the backfill gives, by row:

- No transactions yet: `openingBalance = balance`, the typed starting
  balance. Correct.
- Transactions, balance already overwritten by the bug: `balance` equals
  the net, so `openingBalance = 0`. The lost amount stays lost (non-goal).
- Transactions, then a manual balance edit after the last one: the edit
  is kept as the opening amount. Correct, and the same as behaviour 3.

After the backfill, every row satisfies goal 2, so the first recompute
after deploy changes no balance.

## Constraints

- Next.js 15 App Router, Prisma 6 on Postgres, yarn 1. The Prisma client
  is generated into `src/generated/prisma` on `postinstall`; regenerate
  after the schema change.
- Migrations are applied with `prisma migrate deploy` in production;
  this one must be safe to run on a populated table (the backfill is a
  single `UPDATE … FROM` over a grouped subquery).

## Verification (done means all of these)

- `yarn validate` and `yarn build` pass, with their output counts recorded.
- Against a dev database with the migration applied, signed in through
  the browser: the worked example above gives 100, 80, 75, 95, checked
  through `GET /api/accounts` at each step. The rename after the €20
  expense succeeds. The 7-day chart for the account starts at €100, not 0.
- The backfill is checked on a dev row created before the migration
  (an account with no transactions keeps its balance as `openingBalance`).

## Docs touched

- `docs/data-models.md`: the `FinancialAccount` model gains the column.
- `docs/api-documentation.md`: the balance rule, and what a balance edit
  means.
- A progress log entry in `docs/progress/` for the session.

## Left to the builder

- The helper's name and signature.
- Whether `recomputeAccountBalance()` reads `openingBalance` in the same
  query that checks account ownership (it already reads the account).

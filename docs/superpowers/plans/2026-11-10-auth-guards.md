# Auth guards plan

Spec: `docs/superpowers/specs/2026-11-10-auth-guards-design.md`.
Branch: `fix/auth-guards`, stacked on `fix/next-security-patch` (`fe883e3`).
Ledger: `.superpowers/sdd/2026-11-10-auth-guards/ledger.md`.

The project has no test suite; the checks are `yarn validate`, `yarn build`,
and signed-out `curl` against `yarn start`. The main session runs those, not
the implementer.

## Task 1: redirect signed-out visitors, delete the dead middleware

Route: `implementer-transcribe` (the plan carries the complete change).

Files:

- `src/app/transactions/page.tsx`
- `src/app/transactions/[id]/edit/page.tsx`
- `src/app/accounts/[id]/edit/page.tsx`
- `src/app/@editAccountModal/(.)accounts/[id]/edit/page.tsx`
- `src/app/@editTransactionModal/(.)transactions/[id]/edit/page.tsx`
- `middleware.ts` (deleted)

Change, in each of the five page files:

1. In the `next/navigation` import, replace `forbidden` with `redirect`:
   - `src/app/transactions/page.tsx`:
     `import { forbidden } from 'next/navigation';` →
     `import { redirect } from 'next/navigation';`
   - the other four:
     `import { forbidden, notFound } from 'next/navigation';` →
     `import { notFound, redirect } from 'next/navigation';`
2. Replace the guard body `return forbidden();` with
   `redirect('/auth/signin');` (no `return`, as in
   `src/app/accounts/page.tsx`). Nothing else in the files changes.

Then `git rm middleware.ts`.

Commits (Conventional Commits, no AI trailer):

- `fix(auth): redirect signed-out visitors to sign-in` — the five pages.
- `refactor(auth): remove uncompiled root middleware` — the deletion.

Acceptance (run by the implementer; quote the output):

```bash
grep -rn "forbidden" src/app
test ! -e middleware.ts && test ! -e src/middleware.ts && echo no-middleware
yarn validate
```

Expected: `grep` prints nothing (exit 1); `no-middleware`; `yarn validate`
exits 0.

Main-session verification after the task (not the implementer's):

- `yarn build`: exit 0, no `Middleware` line in the route table,
  `.next/server/middleware-manifest.json` `middleware` is `{}`.
- `yarn start -p 3100`, signed-out curl with the format string
  `'%{http_code} %{redirect_url}'` on `/transactions`,
  `/transactions/x/edit`, `/accounts/x/edit` → `307 …/auth/signin`;
  `/accounts` → `307 …/auth/signin`; `/api/accounts` → `401`.
- Browser pane, signed out, on `/auth/signin`: soft-navigate with
  `window.next.router.push('/accounts/x/edit')` and then
  `'/transactions/x/edit'`. Expected: it lands on `/auth/signin` and the
  network panel stops (no repeated RSC requests). If it loops, add
  `src/app/@editAccountModal/[...catchAll]/page.tsx` and
  `src/app/@editTransactionModal/[...catchAll]/page.tsx`, each
  `export default function CatchAll() { return null; }`, as a fix round of
  this task, and re-run.

## Task 2: docs

Route: `implementer` (prose edits needing judgment).

- `docs/auth.md`: overview bullet (line 8–9) and the "Route Protection"
  section: what each server page does for a signed-out visitor
  (`/auth/signin` for the accounts and transactions pages, `/` for
  `/dashboard`, 404 for `/accounts/[id]`, and no check at all on
  `/accounts/new` and `/transactions/new`, whose forms post to APIs that
  answer 401); there is no middleware, by decision (point to the spec), and
  re-adding one needs `src/middleware.ts` plus the next-auth ≥ 4.24.15 bump.
  Constraint: the edited docs must not mention `forbidden()` (the acceptance
  grep checks it).
- `CLAUDE.md` code map, "Auth and route protection": drop the `forbidden()`
  mention and the "not compiled" bullet; say there is no middleware by
  decision and where it would have to live (`src/middleware.ts`).
- `docs/folder-structure.md` line 21 (`/middleware.ts`): remove the entry or
  say it was removed (the doc describes a planned layout; keep it consistent).
- New `docs/progress/2026-11-10-auth-guards-session.md` + a line in the
  index of `docs/progress/README.md`; amend its naming convention (line 7) to
  allow `YYYY-MM-DD-<topic>-session.md` when a day has more than one
  session. Content: the before/after curl table, build and browser evidence
  the controller supplies; under "Still open", the `/dashboard` → `/` and
  `/accounts/[id]` → 404 inconsistencies, the unguarded `/accounts/new` and
  `/transactions/new`, and the missing `callbackUrl`.
- Leave `docs/chat.md` (a historical chat log) and
  `docs/progress/2026-11-10-session.md` (another session's log) untouched.

Commit: `docs(auth): record per-route guards, no middleware`.

Acceptance: `yarn format:check` exits 0;
`grep -n "forbidden\|not compiled" CLAUDE.md docs/auth.md docs/folder-structure.md`
prints nothing.

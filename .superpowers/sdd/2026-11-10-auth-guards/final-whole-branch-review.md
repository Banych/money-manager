# Whole-branch review: fix/auth-guards (fe883e3..0487258)

Agent: `task-reviewer-capable`, read-only, returned as text; saved here by
the main session, condensed.

## Verdict

APPROVED. No Critical or Important findings.

## Findings (all Minor)

1. CLAUDE.md code map (lines 24–27) leaves `/transactions/[id]` out of the
   signed-out redirect list; the page redirects (`src/app/transactions/[id]/page.tsx:20-21`,
   curl `/transactions/x` → 307 `/auth/signin`). Verified.
2. Spec and plan name a browser check started from `/auth/signin`; the
   ledger records only runs started from `/`. Verified mismatch; loop risk
   from `/auth/signin` suspected unlikely.
3. Ledger says the Task 2 review left three Minor notes but describes two.
   Verified.
4. `yarn format:check` fails in the worktree on the untracked, unformatted
   `final-simplification.md` (not on the branch). The committed range is
   Prettier-clean. Verified.

## Correctness review (summary)

- Nothing relies on the deleted middleware, `forbidden()` or
  `unauthorized()` (grep over `src`, `next.config.*`, `package.json`: no
  match). Every API handler (6 files, 11 methods, excluding next-auth's)
  returns 401 itself.
- Modal slots: `routes-manifest.json` rewrites `/accounts/:id/edit` and
  `/transactions/:id/edit` to the `(.)` routes when `next-url` is present;
  RSC curl (`RSC: 1`, `Next-Url: /`) returned 200 with
  `NEXT_REDIRECT;replace;/auth/signin;307;` in the slot segments. Hard
  loads render the slot's `default.tsx` and the page issues the 307.
- No try/catch, `error.tsx` or `global-error.tsx` can swallow the redirect;
  `RedirectBoundary` is innermost (`layout-router.js:488`), `ErrorBoundary`
  re-throws router errors (`error-boundary.js:35`); `ModalErrorBoundary` is
  a window listener, not mounted when the guard fires.
- `redirect()` returns `never`, so narrowing holds; `tsc` exit 0. The
  redirect precedes the DB lookup, so no existence oracle.
- Docs claims checked against code and `node_modules` (withAuth 307s on
  `/api/*`, `getToken` only via middleware, cookie clean-up at
  `session.js:79-80`).

## Reviewer's own run (production build at 11:20:17, after `974924a`)

Signed-out curl on `yarn start -p 3177`: `/transactions`,
`/transactions/x/edit`, `/accounts/x/edit`, `/accounts`, `/transactions/x`
→ 307 `/auth/signin`; `/accounts/x` → 404; `/dashboard` → 307 `/`;
`/accounts/new`, `/transactions/new` → 200; `/api/accounts`,
`/api/transactions` → 401. `yarn lint` exit 0; `tsc --noEmit
--incremental false` exit 0; middleware manifest `"middleware": {}`.
Server stopped by PID.

## Deferred-minor triage

Plan-check items all applied (checked in plan and spec). Task 2 notes on
the older session log and `docs/architecture.md`: fine. Third Task 2 note
unrecorded (finding 3).

## Unverified

Client-side end of the modal redirect (rests on the main session's browser
run); `router.refresh()` with a modal open after session expiry; the
advisory's fixed version.

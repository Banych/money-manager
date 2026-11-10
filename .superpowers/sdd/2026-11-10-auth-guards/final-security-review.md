# Security review: fix/auth-guards (fe883e3..0487258)

Agent: `security-reviewer`, read-only, returned as text; saved here by the
main session, condensed to findings and evidence pointers.

## Verdict

APPROVED. No security defect introduced by the range. One pre-existing
Critical (sign-in `callbackUrl`) to fix separately.

## Findings

1. **Critical, pre-existing: open redirect through `callbackUrl`, likely
   `javascript:` XSS.** `src/app/auth/signin/page.tsx:22` reads
   `callbackUrl` from the query string; line 27 runs
   `router.push(callbackUrl)` unchecked when the visitor is already signed
   in. Next's router classes a cross-origin URL (and `javascript:…`, origin
   `null`) as external and calls `location.assign` on it
   (`app-router-instance.js:218`, `navigate-reducer.js:163`,
   `app-router.js:275`). Link `…/auth/signin?callbackUrl=https://evil.example`
   sends a signed-in user off-site; `callbackUrl=javascript:…` probably runs
   script in the app's origin (no CSP), able to read and change all the
   user's data through the same-origin API. The server-side
   `signIn('google', { callbackUrl })` path is safe:
   `authConfig.callbacks.redirect` (`src/lib/auth.ts:28-38`) allows same
   origin only. Open redirect verified at router-logic level offline;
   script execution suspected, not run in a browser. Not exposed further
   by this range (the new redirects pass no `callbackUrl`), but the spec's
   "pass `callbackUrl`" follow-up would widen it. Fix: accept only a path
   starting with `/` and not `//` or `/\`, else `/`; or require
   `new URL(callbackUrl, location.origin).origin === location.origin`.
2. **Minor, pre-existing: undefined `userId` disables owner filters.**
   `src/lib/auth.ts:51-58` sets `session.user.id` only when `token.id`
   exists; Prisma treats `where: { userId: undefined }` as no filter. No
   known way to get a valid token without `id` (encrypted JWT, `jwt`
   callback always sets it). Fix: treat a missing `session.user.id` as
   signed out in `getAuthSession()`. Suspected; Prisma behaviour not run.
3. **Minor, pre-existing: raw error text in a 500.**
   `src/app/api/transactions/route.ts:149-157` returns
   `details: { name, message }`. Authenticated user, own request only.
   Fix: drop `details`.

## Ruled out (summary)

- Nothing relied on the deleted middleware: no `withAuth`, `getToken` or
  `next-auth/middleware` import anywhere in `src`/`types`; no
  `src/middleware.ts` ever existed (`git log --all`); every route its
  matchers named has its own session check.
- Every `src/app/api/**/route.ts` except next-auth's checks the session and
  filters by `userId` (accounts list/create, account by id
  GET/PUT/DELETE, statistics, account transactions, transactions
  list/create with account ownership check, transaction by id
  GET/PUT/DELETE; `recomputeAccountBalance` re-checks).
- The five changed pages check ownership after the session check
  (`findUnique({ where: { id, userId } })` → `notFound()`); `redirect()` is
  not inside any `try`.
- `/accounts/new`, `/transactions/new` and their modals render no user
  data server-side; client forms fetch `/api/accounts` (401 signed out).
- No middleware is sound: next-auth 4.24.11 `getToken` throws
  `URIError` on `Bearer %E0%A4%A` (probe reproduced), reachable only via
  `withAuth`; the app uses `getServerSession`.
- CSRF blocked by `sameSite: "lax"` session cookie and no CORS headers.
  No mass assignment (Zod drops unknown keys; `userId` set after spread).
  No secrets in the range.

## Evidence

Commands and probe outputs are in the agent's handback (2026-11-10):
`git diff fe883e3..0487258 -- middleware.ts src/`, `git log --all --
middleware.ts src/middleware.ts`, searches over `src`/`types`, installed
versions (`next` 15.5.29, `next-auth` 4.24.11, `@prisma/client` 6.9.0),
an offline probe of Next's router URL classification and of next-auth
`getToken`, and a secret scan over the range. The agent wrote nothing in
the repository; its probes were in its scratchpad.

## Unverified

- Browser execution of the `javascript:` payload and the end-to-end
  external redirect.
- Prisma's `userId: undefined` behaviour in this client.
- The advisory's fixed version (taken from the spec).

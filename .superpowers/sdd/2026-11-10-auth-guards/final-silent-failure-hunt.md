# Silent-failure hunt: auth guards branch (2026-11-10)

Range `fe883e3..0487258` on `fix/auth-guards`. Read-only pass; nothing was
built, run or edited apart from this file. Installed versions read from
`node_modules`: next 15.5.29, next-auth 4.24.11.

## Verdict

**No silent failure introduced by the range.** The five
`return forbidden();` → `redirect('/auth/signin');` swaps and the deletion of
the root `middleware.ts` close no error path and open none. Each hypothesis
from the brief was checked and is recorded below with its evidence. The
findings that remain are pre-existing; one of them (the session guard
checking `session.user` but not `session.user.id`) is a latent fail-open
whose reachability is uncertain.

## Hypotheses checked (introduced code paths)

1. **`redirect()`'s NEXT_REDIRECT throw being swallowed: not possible
   here.** None of the five pages has a `try`/`catch` or `.catch()` around
   the guard. There is no `error.tsx` or `global-error.tsx` anywhere under
   `src/app` (`find` over the tree), no server action (`'use server'` grep:
   none), and no `isRedirectError`/`unstable_rethrow`/`NEXT_REDIRECT`
   handling in `src`. The only error-catching component on the modal path,
   `ModalErrorBoundary` in `src/components/ui/intercepted-modal.tsx`, is a
   client-side `window` `error` listener; the redirect is thrown during the
   server render, before that component exists, so it cannot see it. The
   ledger's browser check (two RSC requests per soft navigation, ending on
   `/auth/signin`) agrees.
2. **Guard failing open when `getAuthSession()` throws: it fails closed.**
   `getServerSession` (next-auth `next/index.js`) throws
   `new Error(body.message)` when the session handler answers non-200, e.g.
   a missing `NEXTAUTH_SECRET` in production (`core/index.js` logs
   `NO_SECRET` through next-auth's logger and returns 500). The throw is not
   caught by the page, so the request ends in Next's default error page. A
   JWT that fails to decode, or a `jwt`/`session` callback that throws, is
   caught inside next-auth (`core/routes/session.js`, logged as
   `JWT_SESSION_ERROR`), the body becomes `{}`, `getServerSession` returns
   `null`, and the page redirects. Both outcomes deny access; neither is
   silent server-side.
3. **Partial session: see P1 below.** `!session?.user` is always false for a
   decodable token, because next-auth builds `session.user` from the token's
   name/email/picture before the app's `session` callback runs; the callback
   adds `id` only when `token.id` is set. So a session with a `user` but no
   `id` passes the guard. Pre-existing, not changed by this range.
4. **Deleted middleware relied upon anywhere: no.** No file in `src`,
   `types`, or the root config references `withAuth`, `next-auth/middleware`
   or `middleware` (grep excluding the generated Prisma client). The ledger
   records the baseline build's `.next/server/middleware-manifest.json` as
   empty, so the matchers `/accounts/:path*` and `/api/accounts/:path*` never
   ran; every page and API under those prefixes already carried its own
   check. Remaining doc mentions are the dated 2026-11-10 session log and
   generic lines in `docs/architecture.md`, neither claiming protection.
5. **`notFound()` masking an auth failure:** not in the changed pages. In
   the four edit pages `notFound()` runs only after the signed-in check, for
   a record the user does not own or that does not exist, which is the
   intended no-existence-leak answer. The masking cases that do exist are
   pre-existing (P7) and the spec already lists `/accounts/[id]` as a
   non-goal.

Not a finding, noted for the record: TypeScript narrowing of
`session.user.id` after the guard relies on `redirect()` returning `never`,
which it does; dropping the `return` is correct. A future `loading.tsx` above
these pages would turn the 307 into a streamed 200 plus a client-side
redirect. Today only `src/app/transactions/new/loading.tsx` exists, and it
is not above any of the five pages.

## Pre-existing findings

### P1. Guard checks `session.user`, not `session.user.id`; Prisma drops an `undefined` filter (HIGH, reachability uncertain)

- **Location:** the guard in all five changed pages (e.g.
  `src/app/transactions/[id]/edit/page.tsx:21`), followed by
  `where: { id, userId: session.user.id }` (edit pages) and
  `getAllTransactions({ userId: session.user.id, … })`
  (`src/app/transactions/page.tsx:41`, `src/lib/queries/transactions.ts:106`).
  The same shape is in `src/app/accounts/page.tsx`,
  `src/app/accounts/[id]/page.tsx` and the API routes.
- **Issue:** `src/lib/auth.ts`'s `session` callback sets `session.user.id`
  only `if (session?.user && token?.id)`. When `token.id` is absent, the
  session still has a `user` (see hypothesis 3), the guard passes, and
  `userId` is `undefined`. Prisma treats an `undefined` field in `where` as
  "no filter" (no `strictUndefinedChecks` preview feature in
  `prisma/schema.prisma`). The edit pages would then load **any user's**
  record by id, and `/transactions` would list **every user's**
  transactions. Nothing logs it; it renders as a normal page.
- **Reachability (uncertain):** not reachable with tokens this app mints
  today. The `jwt` callback has set `token.id = user.id` on sign-in since
  the first auth commit (`d425cb8`), and the JWT is signed, so a visitor
  cannot strip the field. It becomes reachable if the `jwt` callback's
  `if (account && user)` branch is changed or bypassed, or if
  `types/next-auth.d.ts`'s `id: string` keeps the compiler from flagging a
  missing id after a refactor. Severity is for the impact; the likelihood
  is low.
- **Recommendation:** fail closed on the field the queries use. One helper
  in `src/lib/auth.ts`, used by every page:

  ```ts
  export async function requireUserId(): Promise<string> {
    const session = await getAuthSession();
    if (!session?.user?.id) redirect('/auth/signin');
    return session.user.id;
  }
  ```

  The API routes need the same `?.id` check, answering 401.

### P2. API route `catch` blocks log nothing in production (HIGH)

- **Location:** every `src/app/api/**/route.ts` handler, e.g.
  `src/app/api/accounts/route.ts:24-33`:
  `if (process.env.NODE_ENV !== 'production') console.error(…)`, then a
  generic 500.
- **Issue:** in production, every unexpected error (Prisma failure,
  `getAuthSession()` throwing, validator bugs) is swallowed into
  `{ error: 'Internal Server Error' }` with no server log. The spec leans on
  these handlers as the only guard for `/accounts/new` and
  `/transactions/new`, so their failures matter more after this branch than
  before, though the branch does not touch them.
- **Hidden errors:** database connectivity and constraint errors, next-auth
  configuration errors (`NO_SECRET`), any `TypeError` in handler code.
- **Recommendation:** log unconditionally (`console.error` with the route
  and operation), keeping the generic body for the client.

### P3. Signed-out submit on `/accounts/new` and `/transactions/new` ends in a bare "Unauthorized" toast (MEDIUM)

- **Location:** `src/hooks/useAccounts.ts:42-44` and `:80-83`,
  `src/hooks/useTransactions.ts:174-177` and `:202-205`; the API answers
  `{ error: 'Unauthorized' }` with status 401.
- **Issue:** the spec accepts these pages having no session check. The
  result for a signed-out visitor is a filled-in form, then a toast reading
  "Unauthorized", with no link to sign in and no redirect. The visitor is
  not told what to do. On `/transactions/new` the account list fetch fails
  first ("Failed to fetch accounts").
- **Recommendation:** either give the two pages the same
  `redirect('/auth/signin')` guard (this branch's rule, two more lines), or
  map a 401 in the mutation's `onError` to a sign-in prompt. Already under
  "Still open" in the progress record; this adds the user-visible symptom.

### P4. Sign-in failures are silent in production (MEDIUM)

- **Location:** `src/app/auth/signin/page.tsx:33-41`.
- **Issue:** `handleSignIn` catches every `signIn('google')` error, resets
  the spinner, and logs only outside production. The user clicks, the
  button comes back, nothing explains why. After this branch,
  `/auth/signin` is the landing point for five more pages, so more visitors
  reach this path.
- **Recommendation:** show an error message (the page already has a toast
  provider in the root layout) and log in all environments.

### P5. `generateMetadata` in `/accounts/[id]` swallows every error (MEDIUM)

- **Location:** `src/app/accounts/[id]/page.tsx:21-44`, bare `catch { … }`.
- **Issue:** any `getAuthSession()` or Prisma error becomes a default title
  with no log. Impact is limited because the page body repeats both calls
  and throws, but the first failure's cause is lost.
- **Recommendation:** narrow or log the catch, or drop it and let the page
  fail once.

### P6. `ModalErrorBoundary` is not an error boundary (MEDIUM)

- **Location:** `src/components/ui/intercepted-modal.tsx:35-67`, rendered
  by both modal pages in this range.
- **Issue:** it listens to the window-wide `error` event. It does not catch
  React render errors in its children (those need a class boundary or an
  `error.tsx`), and it does replace the modal with "Something went wrong
  with the modal." for any unrelated script error anywhere on the page,
  logging only to the browser console.
- **Recommendation:** replace it with a real boundary (an `error.tsx` in
  each modal slot, or a class component) scoped to the modal subtree.

### P7. Auth or fetch failures shown as 404 (LOW)

- `src/app/accounts/[id]/page.tsx:52-54`: signed-out visitors get
  `notFound()`. Already a recorded non-goal.
- `src/components/transactions/transaction-details.tsx:32-34` (client):
  `if (!transaction) return notFound();` turns a missing query result into
  a 404. With `initialData` this is hard to hit; if it is hit, a 401 or
  network failure reads as "not found".

### P8. No `error.tsx` or `global-error.tsx` (LOW)

- Any throw in a server page (P1's helper failing closed via a throw,
  `NO_SECRET`, a Prisma error, or an invalid `from`/`to` query parameter on
  `/transactions`, which becomes `new Date('garbage')` and fails Prisma
  validation at `src/app/transactions/page.tsx:36-37`) shows Next's bare
  default error page. Server-side it is logged by Next, so it is not
  silent; the visitor gets no next step.

## Uncertain, labelled

- P1's reachability (above).
- The modal-slot redirect on soft navigation was checked in the browser by
  the main session (ledger, Task 1), not by this pass.

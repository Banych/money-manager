# Session Log – 2026-11-10 – Sign-in `callbackUrl` open redirect

## What was wrong

`src/app/auth/signin/page.tsx` read `callbackUrl` from the query string and,
when the visitor was already signed in, called `router.push(callbackUrl)`
without checking it. Next's router treats a cross-origin URL (and a
`javascript:` URL, whose origin is `null`) as external and hands it to
`location.assign`.

Found by the end-of-branch security review of `fix/auth-guards` (pre-existing
on master). The server-side `signIn` redirect was already safe:
`authConfig.callbacks.redirect` in `src/lib/auth.ts` allows same-origin only.

## Reproduced (unpatched master, `yarn build && yarn start -p 3100`, signed in)

Browser pane, `http://localhost:3100/auth/signin?callbackUrl=…`:

| `callbackUrl`                     | Before                                                                               | After              |
| --------------------------------- | ------------------------------------------------------------------------------------ | ------------------ |
| `https://example.com`             | landed on `https://example.com`                                                      | `/` → `/dashboard` |
| `javascript:document.title='xss'` | **script ran in the app's origin**: page body replaced with `xss` (the return value) | `/` → `/dashboard` |
| `//example.com`                   | landed on `http://example.com/`                                                      | `/` → `/dashboard` |
| `/\example.com`                   | landed on `http://example.com/`                                                      | `/` → `/dashboard` |
| `/transactions` (legitimate)      | –                                                                                    | `/transactions`    |

Signed out (`127.0.0.1:3100`, `callbackUrl=https://example.com`): the sign-in
page renders normally, no redirect, no console errors.

## Fix

- New `src/lib/callback-url.ts` → `toSafeCallbackPath(callbackUrl, origin, fallback = '/')`:
  resolves against `origin`, rejects any other origin or protocol (a `blob:`
  URL reports its inner origin, so protocol is checked too), collapses a
  leading `//` in the path, returns `pathname + search + hash`.
- The sign-in page uses it for both `router.push` and the `signIn` callback.
- Other `callbackUrl` users need nothing: `navigation.tsx` hard-codes `/`,
  `profile-dropdown.tsx` builds it from `window.location.origin`.

## Verification

- Helper: 19 cases run with Node 24 type stripping (scratch script, the repo
  has no test runner) – 19 passed, 0 failed. The first run caught the `blob:`
  case above (1 failed), which led to the protocol check. The cases, with
  origin `http://localhost:3100` (input → output):
  - `null`, `''` → `/`
  - `/dashboard` → `/dashboard`; `/transactions?page=2#x` → itself;
    `dashboard` → `/dashboard`; `http://localhost:3100/accounts` → `/accounts`
  - `https://example.com`, `http://localhost:3101/x`, `//example.com`,
    `/\example.com`, `\\example.com` → `/`
  - `javascript:document.title='xss'`, `JaVaScRiPt:alert(1)`,
    `␠javascript:alert(1)`, `data:text/html,hi`,
    `blob:http://localhost:3100/abc`, `http://[bad` → `/`
  - `http://localhost:3100//example.com` → `/example.com`;
    `/%2F%2Fexample.com` → itself (encoded, stays same-origin)
- `yarn validate`: exit 0 – lint 0 errors, 4 pre-existing `no-console`
  warnings; Prettier clean; `tsc --noEmit` clean.
- `yarn build`: exit 0.
- Whole-branch review and security review (read-only agents): both approved.
  Between them they fuzzed the helper with 900,000 random inputs, resolving
  each output the way the installed Next router does, with none leaving the
  origin. Installed versions: Next 15.3.3, next-auth 4.24.11.
- Known, accepted: the check uses `window.location.origin`, so if the app is
  served on a host other than `NEXTAUTH_URL` (e.g. `127.0.0.1` vs
  `localhost`), an absolute `callbackUrl` on the `NEXTAUTH_URL` host falls
  back to `/`. Nothing in the app builds such a URL today.

## Follow-ups (not done here)

- The repo has no test runner, so the cases above are not committed as
  tests. Adding one (e.g. Vitest) would let them be.
- Hardening, not exploitable: `authConfig.callbacks.redirect` in
  `src/lib/auth.ts` passes `blob:<app origin>/…` through, because a `blob:` URL
  reports its inner origin. Browsers refuse an HTTP redirect to `blob:`; a
  protocol check there would close it.

## Also fixed: a session without `user.id` counted as signed in

Every server guard calls `getAuthSession()` and checks only `session?.user`,
then filters by `userId: session.user.id`. Prisma reads `userId: undefined` as
no filter. The `session` callback sets `user.id` only when the token has an
`id`, so a token without one gave a session that passed the guard with no
owner filter. No known path in the app issues such a token (the `jwt` callback
sets `id` at sign-in); forging one needs `NEXTAUTH_SECRET`. So this is
hardening, approved by Vlad as an add-on to this branch.

Reproduced on the build above (callbackUrl fix only), with session tokens
minted from the local `.env` secret and sent to `127.0.0.1:3100`. Vlad's
real session sees 1 account and 1 transaction.

| Request                                       | Before            | After                   |
| --------------------------------------------- | ----------------- | ----------------------- |
| `/api/accounts`, no cookie                    | 401               | 401                     |
| `/api/accounts`, token with an unknown `id`   | 200, 0 rows       | 200, 0 rows             |
| `/api/accounts`, token without `id`           | **200, Vlad's 1** | 401                     |
| `/api/transactions`, token without `id`       | **200, Vlad's 1** | 401                     |
| `/dashboard`, `/accounts`, token without `id` | –                 | 307, as when signed out |
| `/transactions`, token without `id`           | –                 | 500, as when signed out |

The 500 is the existing `forbidden()` behaviour for signed-out visitors,
fixed separately on `fix/auth-guards`.

Fix: `getAuthSession()` in `src/lib/auth.ts` returns `null` when the session
has no `user.id`. Nothing else calls `getServerSession`, so every guard gets
it. `yarn validate` exit 0 (lint 0 errors, the same 4 `no-console` warnings;
Prettier and `tsc` clean); `yarn build` exit 0. In the browser pane, Vlad's
session still loads the dashboard and `/transactions`, and both APIs return 200.

Security review of this commit (read-only agent): approved, no findings.
Known, accepted, not run: a token without `id` would likely bounce between
`/auth/signin` and the server-guarded pages, because the client `useSession`
still sees `session.user`. Every token from a real sign-in has carried `id`
since auth was added, so only a forged token hits this.

# Session Log – 2026-11-10 (auth guards)

## Session Focus: signed-out visitors on guarded pages

Five server pages called `forbidden()` for a signed-out visitor. With
`experimental.authInterrupts` off, `/transactions` answered 500 instead of
sending the visitor to sign in. The root `middleware.ts` was never compiled
(the app lives under `src/app`), so it protected nothing. Spec:
`docs/superpowers/specs/2026-11-10-auth-guards-design.md`.

## What changed

- The five pages that called `forbidden()` now call
  `redirect('/auth/signin')` for a signed-out visitor: `/transactions`,
  `/transactions/[id]/edit`, `/accounts/[id]/edit` and the two edit modals.
  (The scope widened from `/transactions` alone to every call site; same
  defect.)
- The root `middleware.ts` was deleted. No middleware, by decision.
- `docs/auth.md`, `CLAUDE.md` and `docs/folder-structure.md` now describe the
  per-page behaviour and where a middleware would have to live.

## Verified (signed-out curl, Next 15.5.29, `yarn start -p 3100`)

| Path                   | Before (`dd7e523`) | After              |
| ---------------------- | ------------------ | ------------------ |
| `/transactions`        | 500                | 307 `/auth/signin` |
| `/transactions/x/edit` | 500                | 307 `/auth/signin` |
| `/accounts/x/edit`     | 500                | 307 `/auth/signin` |
| `/accounts`            | 307                | 307                |
| `/api/accounts`        | 401                | 401                |

Build: `yarn validate` exit 0 (5 `no-console` lint warnings in untouched
files). `rm -rf .next && yarn build` exit 0; the route table has no
`Middleware` line and `.next/server/middleware-manifest.json` is
`{"version":3,"middleware":{},"functions":{},"sortedMiddleware":[]}`, the
same as the baseline.

Browser check for a redirect loop in the modal slots (a risk inferred from
Next's source, not seen before): in the browser pane on
`http://127.0.0.1:3100/`, `window.next.router.push('/accounts/x/edit')` and,
from a fresh `/`, `'/transactions/x/edit'` each made exactly two RSC requests
(the target, then `/auth/signin`) in 6–8 s and ended on `/auth/signin`. No
loop, so the catch-all fallback was not added. Server log showed no errors.

## Verification traps

- Stopping the baseline server with `pkill -f 'next start -p 3100'` matched
  its own shell and left the server running, so the first post-change curl hit
  the stale process (500s). Stop servers by the PID holding the port.
- A server started with a different `NEXTAUTH_SECRET` makes next-auth v4 clear
  the browser's session cookie on its next `/api/auth/session` call (it cleans
  up undecodable session cookies;
  `node_modules/next-auth/core/routes/session.js:79-80`). Use `127.0.0.1`
  rather than `localhost` for signed-out browser checks, so the developer's
  own session cookie is not touched.

## Still open

- `/dashboard` redirects to `/` and `/accounts/[id]` answers 404, unlike the
  other pages, which redirect to `/auth/signin`.
- `/accounts/new` and `/transactions/new` (and their modals) have no session
  check; their forms post to APIs that answer 401.
- The sign-in redirects pass no `callbackUrl`, so a visitor lands on the
  default page after signing in.

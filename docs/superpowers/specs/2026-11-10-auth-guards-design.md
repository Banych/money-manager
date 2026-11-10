# Auth guards: signed-out pages redirect, dead middleware removed

Date: 2026-11-10. Vlad skipped the design questions ("skip questions"), so
every choice below is the implementer's call and is marked as such.

## Why

Two auth-guard defects were found on 2026-11-10 while verifying the Next.js
security bump (`docs/progress/2026-11-10-session.md`, "Found while verifying"):

1. `middleware.ts` at the repository root is never compiled. The app is under
   `src/app`, so Next only loads `src/middleware.ts`; the build's
   `.next/server/middleware-manifest.json` is empty. The file reads as
   protection that is not there.
2. Signed-out visitors get a 500 from every page that calls `forbidden()`
   from `next/navigation`, because `experimental.authInterrupts` is not set.
   The brief named `/transactions`; reading the code found five such pages:
   - `src/app/transactions/page.tsx`
   - `src/app/transactions/[id]/edit/page.tsx`
   - `src/app/accounts/[id]/edit/page.tsx`
   - `src/app/@editAccountModal/(.)accounts/[id]/edit/page.tsx`
   - `src/app/@editTransactionModal/(.)transactions/[id]/edit/page.tsx`

## Decisions (implementer's call)

- **Signed-out visitors on those five pages are redirected to
  `/auth/signin`**, using `redirect('/auth/signin')` exactly as
  `src/app/accounts/page.tsx` and `src/app/transactions/[id]/page.tsx` already
  do. Rejected: enabling `experimental.authInterrupts` plus a `forbidden.tsx`
  page. A signed-out visitor needs a way to sign in, not a "forbidden" page,
  and it adds an experimental flag for no gain.
- **`middleware.ts` is deleted, not moved to `src/`.** Protection stays per
  route: every API handler already returns 401 itself, and every server page
  that reads user data checks the session. (`/accounts/new` and
  `/transactions/new` do not check it: they only render a form whose submit
  hits an API that answers 401. Accepted; listed under "Still open" in the
  progress record. The middleware never compiled, so this is not a
  regression.) Moving it would (a) turn the API's 401s into 307
  redirects for `/api/accounts/*`, (b) make the `next-auth` `getToken()`
  malformed-Bearer advisory reachable, which would need the next-auth
  ≥ 4.24.15 bump paired with it, and (c) add a second guard that covers only
  two path prefixes. Revisitable: if a later change wants a single gate,
  re-add `src/middleware.ts` with the next-auth bump.
- **The branch is stacked on `fix/next-security-patch`** (local tip
  `fe883e3`), not cut from `origin/master` as the brief said. The CLAUDE.md
  code map and the rewritten `docs/auth.md` "Route Protection" section only
  exist on that branch; cutting from master would make the CLAUDE.md update
  impossible and guarantee a docs conflict. Cost: this branch merges after
  the security branch. Revisitable by rebasing onto master once that lands.

## Agreed behaviour (signed-out, production build)

| Request                       | Before               | After                |
| ----------------------------- | -------------------- | -------------------- |
| `GET /transactions`           | 500                  | 307 → `/auth/signin` |
| `GET /transactions/<id>/edit` | 500                  | 307 → `/auth/signin` |
| `GET /accounts/<id>/edit`     | 500                  | 307 → `/auth/signin` |
| `GET /accounts`               | 307 → `/auth/signin` | unchanged            |
| `GET /api/accounts`           | 401                  | unchanged            |

The two modal pages only render on a client-side navigation inside the app,
so curl cannot reach them. They get the same one-line change. On a soft
navigation the redirect may loop: `/auth/signin` has no match in the modal
slot, so the router could keep the errored slot segment and replay the
redirect (inferred from Next 15.5.29's router source by the plan check, not
observed). It is checked in the browser pane by soft-navigating to
`/accounts/x/edit` and `/transactions/x/edit` from `/auth/signin` while
signed out. If it loops, each slot gets a `[...catchAll]/page.tsx` that
returns `null`, so the slot matches every other route and drops the errored
segment.

The build's route table shows no `Middleware` line and
`.next/server/middleware-manifest.json` has an empty `middleware` object —
the same as today, but now because there is no file.

## Non-goals

- `/dashboard` redirecting to `/` and `/accounts/[id]` answering 404 for a
  signed-out visitor are inconsistent with the rest but are not errors; left
  as they are.
- No `callbackUrl` on the redirect (the sign-in page reads one, but no
  existing guard passes it); a possible follow-up.
- No next-auth bump: with no middleware, the `getToken()` advisory stays
  unreachable.

## Docs

`docs/auth.md` (overview line and "Route Protection"), CLAUDE.md's
"Auth and route protection" code map, and `docs/folder-structure.md`'s
`/middleware.ts` line are updated to match. A progress record holds the
build and curl evidence.

# Final simplification report: auth-guards (fe883e3..0487258)

Report only; nothing applied.

## Verdict

No code simplification proposed. The five `.tsx` edits (the agent wrote "six"; corrected by the
fix-wave re-review against `git diff --stat`) are the minimum
(import swap + one line) and match the existing `redirect('/auth/signin')`
guards in `src/app/accounts/page.tsx` and `src/app/transactions/[id]/page.tsx`
(no stray `return`, same form). The `middleware.ts` deletion leaves no
dangling reference: a grep for `forbidden`, `authInterrupts` and
`middleware` outside `docs/chat.md` (old chat transcript), `docs/architecture.md`
(generic future-work prose) and the progress/spec records finds only the
intentional new text.

## Proposals (docs, optional, low value)

1. CLAUDE.md:29-31 (the "A middleware would have to live in
   `src/middleware.ts` ... needs next-auth >= 4.24.15 first" bullet)
   restates docs/auth.md:134-141. Before: 3-line bullet. After:
   `- Re-adding a middleware has constraints; see docs/auth.md.`
   Why: CLAUDE.md is read every session and the constraints can drift in
   two places. Risk: low; a reader loses the one-line hint that a root
   `middleware.ts` is a trap. Skip if you value that hint in the map.

2. docs/progress/2026-11-10-auth-guards-session.md:57-64 ("Still open")
   repeats the spec's Non-goals and CLAUDE.md's per-page list
   (dashboard `/`, `/accounts/[id]` 404, `/new` unchecked, no callbackUrl).
   Not a simplification worth making: a progress record is a dated
   snapshot and the "open" list is its job. Left as is.

## Out of scope (not touched by this range, do not do now)

- Seven server pages repeat `const session = await getAuthSession(); if
(!session?.user) redirect('/auth/signin');`. A shared
  `requireSession()` returning the session (or redirecting) would remove
  ~4 lines per page and let TS narrow `session.user`. It would touch pages
  this range did not (`/accounts`, `/transactions/[id]`) and must keep the
  intentional differences (`/dashboard` -> `/`, `/accounts/[id]` ->
  `notFound()`), so the gain is small. Revisit if a `callbackUrl` follow-up
  lands, since that would otherwise be edited in seven places.
- The edit page and its modal twin (account and transaction) duplicate
  the guard + fetch + not-found logic; a shared loader would cover both.

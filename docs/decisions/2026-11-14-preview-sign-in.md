# Preview deployments stay signed out

Date: 2026-11-14. Decided by Vlad. Issue 1 of `docs/family-plan.md` (backups,
export and a separate dev database) asked for this decision.

## Context

Vercel builds a preview for every PR, each on its own URL. Since 2026-11-14,
previews run against the `nonprod` database, not production. Google sign-in
accepts only the redirect URIs listed on the OAuth client
(`money-manager-simple.vercel.app` and `localhost:3000`), and Google takes no
wildcards. So a preview cannot complete a Google sign-in.

## Options

Common to all three: previews build and run against `nonprod`.

- **Leave previews signed out.** The public pages can be checked on a preview;
  signed-in work is checked locally on `localhost:3000`, which also uses
  `nonprod`. Nothing to maintain; no signed-in check on a phone before merge.
- **A fixed staging URL.** One branch (for example `staging`) gets a stable
  Vercel alias, which goes into Google's redirect list. Signed-in phone checks
  work, but only for what is pushed to that branch, and the list gains one
  more URI to keep.
- **A test-only sign-in on previews**, such as a password provider enabled
  only on Preview. Any PR could be signed into, at the cost of a second sign-in
  path in `src/lib/auth.ts` that must never reach production and would need
  its own security review.

## Decision

Previews stay signed out. It costs nothing and is cheap to revisit: a staging
alias can be added later without code changes.

## Consequences

- Signed-in checks of a PR happen locally, against `nonprod`.
- Previews get their own `NEXTAUTH_SECRET` (split the same day, after the
  security review showed preview code could forge production sessions with the
  shared one). They still carry production's Google client secret, parked
  (`docs/parking-lot.md`).

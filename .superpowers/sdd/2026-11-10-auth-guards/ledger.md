# Ledger: auth guards (2026-11-10)

Plan: `docs/superpowers/plans/2026-11-10-auth-guards.md`.
Branch `fix/auth-guards`, cut from `fix/next-security-patch` at `fe883e3`.

## Rulings

- 2026-11-10: Vlad: "skip questions". The design choices in the spec are the
  implementer's call: redirect to `/auth/signin`, delete `middleware.ts`,
  stack on the security branch (premise: CLAUDE.md and the rewritten
  `docs/auth.md` exist only there; reopen if that branch merges first, by
  rebasing onto master).
- 2026-11-10: scope widened from `/transactions` to all five `forbidden()`
  call sites (found by grep; same defect).

## Plan check (plan-checker, 2026-11-10, HEAD dd7e523)

Verdict DEFECTS; tamper check clean (status empty, HEAD unchanged). Applied:

- Modal-slot redirect may loop on soft navigation (inferred from Next
  source). Added a browser-pane check to the main-session verification and
  a catch-all fallback if it loops.
- Task 2's "no forbidden() remains" sentence would trip its own grep;
  reworded as a constraint.
- `/accounts/new` and `/transactions/new` have no session check; spec
  corrected, recorded as accepted and "Still open".
- Progress file name: `2026-11-10-auth-guards-session.md`, README naming
  convention amended in Task 2.
- curl format string kept on one line.

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

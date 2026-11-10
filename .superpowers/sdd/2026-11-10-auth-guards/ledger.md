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

## Task 1: redirect guards, delete middleware (done 2026-11-10)

Implementer: `implementer-transcribe`, commits `7235808` (five pages) and
`974924a` (`git rm middleware.ts`). Per-task reviewer skipped under the
transcribe exception: controller byte-compare of `git diff e84b1d0 HEAD`
showed only the planned lines (5× import swap, 5× `return forbidden();` →
`redirect('/auth/signin');`, 16-line deletion of `middleware.ts`).

Ruled correction: the implementer's first commit body said `forbidden()`
"renders a 403 page"; the baseline showed 500. Controller reworded that
commit (tree unchanged; the two original commits were `049ebdc`,
`65977a2`).

Verification (main session, Next 15.5.29, `yarn start -p 3100`):

- `yarn validate`: exit 0 (lint has 5 `no-console` warnings in untouched
  files; Prettier clean; `tsc` clean).
- `rm -rf .next && yarn build`: exit 0; route table has no `Middleware`
  line; `.next/server/middleware-manifest.json` is
  `{"version":3,"middleware":{},"functions":{},"sortedMiddleware":[]}`
  (same as the baseline).
- Signed-out curl, before (baseline build at `dd7e523`) → after:
  `/transactions` 500 → 307 `/auth/signin`; `/transactions/x/edit` 500 →
  307; `/accounts/x/edit` 500 → 307; `/accounts` 307 → 307;
  `/api/accounts` 401 → 401.
- Modal-slot loop check (plan check's inferred risk): browser pane on
  `http://127.0.0.1:3100/` (not `localhost`, which carries Vlad's session
  cookie), `window.next.router.push('/accounts/x/edit')` and, from a fresh
  `/`, `'/transactions/x/edit'`: each made exactly two RSC requests (the
  target, then `/auth/signin`) in 6–8 s and ended on `/auth/signin`. No
  loop; the catch-all fallback was not added. Server log: no errors.

Trap recorded: the baseline run's `pkill -f 'next start -p 3100'` matched
its own shell and left the server running, so the first post-change curl
hit the stale process (500s). Stop servers by the PID holding the port.
Also: a server run with a different `NEXTAUTH_SECRET` would clear a
browser's session cookie on its next `/api/auth/session` call (next-auth
v4 cleans undecodable session cookies); use `127.0.0.1` for signed-out
browser checks instead.

## Task 2: docs (done 2026-11-10)

Implementer: `implementer`, commit `ee6beda` (`CLAUDE.md` code map,
`docs/auth.md`, `docs/folder-structure.md` entry removed, new
`docs/progress/2026-11-10-auth-guards-session.md`, `docs/progress/README.md`
index and naming convention). Controller re-ran acceptance: `yarn
format:check` exit 0; the `forbidden\|not compiled` grep over CLAUDE.md,
`docs/auth.md`, `docs/folder-structure.md` exit 1 (no output).

Review: `task-reviewer`, APPROVED, no Critical/Important; three Minor
notes, none needing a change (the older 2026-11-10 session log keeps its
dated statements; `docs/architecture.md` mentions middleware generically).
Tamper check clean (status empty, HEAD `ee6beda` before and after).

Next: end-of-branch passes (whole-branch review plus security review, as
the range touches auth guards), after Vlad's go-ahead.

## Branch passes (2026-11-10)

Range: `fe883e3..52d4186` (cut point on `fix/next-security-patch` to the
Task 2 ledger commit). Production code changed (five `src/app` pages,
root `middleware.ts` deleted) and the range touches auth guards, so all
four passes run: whole-branch review, silent-failure hunt, simplification
report, security review.

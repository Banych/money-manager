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

### Reports

`final-whole-branch-review.md` (APPROVED, 4 Minor),
`final-security-review.md` (APPROVED for the range; 1 pre-existing
Critical, 2 pre-existing Minor), `final-silent-failure-hunt.md` (nothing
introduced; 8 pre-existing, P1–P8), `final-simplification.md` (no code
change proposed; 1 optional doc trim). Tamper check after all four: only
the three report files the plugin agents and the main session wrote were
new; HEAD `0487258` unchanged; `ledger.md` untouched.

### Rulings

| Finding (sources)                                                                                                                                                                                                                    | Ruling                                                                                                                                                                                                                                          | Cost if wrong                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| CLAUDE.md signed-out list misses `/transactions/[id]` (whole-branch 1)                                                                                                                                                               | Fix                                                                                                                                                                                                                                             | Code map reads as complete and misleads                                |
| Browser check from `/auth/signin` not recorded (whole-branch 2)                                                                                                                                                                      | Fix: record it. It was run (first run, before the `/` runs): from `/auth/signin`, `router.push('/accounts/x/edit')` and `'/transactions/x/edit'` each made one RSC request and stayed on `/auth/signin`; the ledger and progress log omitted it | A spec claim with no recorded run                                      |
| Task 2 third Minor unrecorded (whole-branch 3)                                                                                                                                                                                       | Fix: the third note was that the progress log's focus heading says "guarded pages" while listing the five `forbidden()` pages, which the reviewer verified as accurate; no change                                                               | None                                                                   |
| `final-simplification.md` unformatted (whole-branch 4)                                                                                                                                                                               | Fix: Prettier on the report files before commit                                                                                                                                                                                                 | `yarn validate` fails on the branch                                    |
| Sign-in `callbackUrl` open redirect / likely `javascript:` XSS (security 1)                                                                                                                                                          | Pre-existing, out of scope; recorded in the progress log's "Still open", spec non-goal amended (no `callbackUrl` until validated); proposed to Vlad as its own session                                                                          | A Critical left on master; mitigated only by not being introduced here |
| Guard checks `session.user` not `.id`; Prisma ignores `userId: undefined` (security 2, hunt P1)                                                                                                                                      | Pre-existing, unreachable today; recorded in "Still open"; part of the proposed follow-up                                                                                                                                                       | Every user's rows readable if a token ever lacks `id`                  |
| Raw error text in `POST /api/transactions` 500 (security 3)                                                                                                                                                                          | Pre-existing, out of scope; not recorded beyond this report                                                                                                                                                                                     | Minor info disclosure to the signed-in user                            |
| Production catch blocks don't log (hunt P2), sign-in errors swallowed (P4), bare `catch {}` in metadata (P5), modal error boundary (P6), 404-for-any-error (P7), no `error.tsx` (P8), bare "Unauthorized" toast on `/new` forms (P3) | Pre-existing, out of scope; left in `final-silent-failure-hunt.md`                                                                                                                                                                              | Silent 500s in production stay invisible                               |
| CLAUDE.md re-adding-middleware lines duplicate `docs/auth.md` (simplification)                                                                                                                                                       | Not applied: the line is the code map's warning that a root `middleware.ts` is never compiled                                                                                                                                                   | None                                                                   |
| Shared `requireSession()` helper (simplification, out of scope)                                                                                                                                                                      | Not applied: touches pages outside the range; revisit with the `userId` hardening                                                                                                                                                               | None                                                                   |

### Fix-wave re-review (`0487258..b9a0768`)

`task-reviewer-capable`: APPROVED, 6 Minor; tamper check clean (status
empty, HEAD `b9a0768` before and after). All six fixed in the same round:

- Missing-`id` check: the progress log now gives both ratings (security
  Minor, hunt High with reachability uncertain) instead of "not reachable".
  The Rulings row stands; its "unreachable today" means no known path.
- API handler count corrected to 12 in `final-whole-branch-review.md`
  (the agent's handback said 11; the original handbacks were not saved).
- `final-simplification.md` "six `.tsx` edits" corrected to five.
- Clarification of the Reports paragraph: the tamper check ran before the
  whole-branch report was saved, so three files were new then (the two
  plugin-written reports and the main session's security-report save);
  the fourth, `final-whole-branch-review.md`, was saved afterwards.
- Progress log now splits verified (off-site redirect, offline) from
  suspected (`javascript:` execution). The Rulings row "Fix … no change"
  for the third Task 2 note means "recorded here; no doc change needed".
- Added ruling: shared loader for each edit page and its modal twin
  (simplification, out of scope): not applied, touches pages and modals
  outside the range's purpose; low value.

The browser run from `/auth/signin` has no saved raw output: it is the
first `javascript_exec` result of the Task 1 verification in this
session's transcript (`accounts`/`transactions` each `rsc: 1`, `href`
`/auth/signin`, `session: {}`).

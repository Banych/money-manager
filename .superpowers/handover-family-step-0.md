# Handover (2026-11-11): family plan, step 0 (CI/CD and tests)

Paste the prompt below into a new Claude Code session started in
`~/Documents/repos/money-manager`.

---

## The job

Preparation is finished: the goal is now weekly use by Vlad and their
partner (plan merged in PR #30), and the GitHub milestone "Family M1: start
the trial" (due 2026-12-09) holds issues #31–#45. This session does step 0,
issues #31–#35, one issue and one PR at a time. Start with the first issue
only when Vlad says so, and ask Vlad which order to take; the suggested
order is #35 first (the broken pre-commit hook bites every later commit),
then #31, #32, #33, #34.

## Read first

1. `CLAUDE.md`, all of it. Above all: "There is one database, and it is
   production", "Goal and scope", and the Data section of the code map.
2. `docs/family-plan.md`: step 0, and the "Open questions" section, which
   records the Prisma, Vercel and Google checks of 2026-11-11.
3. The issue you are on: `gh issue view <n>`. Its acceptance criteria are
   the definition of done. Comments count too (#41 has one).
4. `docs/parking-lot.md`: where anything outside the issue goes (the
   `parking-lot` skill).
5. `docs/progress/2026-11-11-family-plan-session.md`: what was checked and
   what was only read from code.

If no `# Workflow: ship profile` block (`# Workflow mode: ship` on a
machine still on the old ship-mode plugin) is in your context, say so
before anything else.

## What is established

Checked by reading the files on 2026-11-11 (nothing below was run unless it
says so):

- CI is `.github/workflows/code-quality.yml`: `on: [push, pull_request]`,
  Node 20, `actions/checkout@v4`, steps `type-check`, `lint`,
  `format:check`, then `validate`, which repeats all three.
- `eslint-config-next` 15.5.29 requires `@rushstack/eslint-patch` at
  `node_modules/eslint-config-next/index.js:53`. The worktree pre-commit
  failure ("Failed to patch ESLint because the calling module was not
  recognized") is only inferred to come from it.
- bobrquiz (`~/Documents/repos/bobrquiz`) is the template:
  `.github/workflows/ci.yml`, `.github/dependabot.yml`, `.nvmrc` (v22),
  `vitest.config.ts`, tests under `src/tests/`. Do **not** copy its
  integration test: it falls back to `DATABASE_URL`, which here is
  production.
- Vercel's database and auth variables are set by hand and target
  production, preview and development alike. Prisma lists no backups for
  the one database. Google sign-in works only on
  `money-manager-simple.vercel.app` and `localhost:3000`, so PR previews
  cannot sign in.

Baseline before step 0, for comparing your own runs:

| Check                 | Before step 0                                  | Expected after                |
| --------------------- | ---------------------------------------------- | ----------------------------- |
| `yarn validate`       | exit 0; lint 0 errors, 4 `no-console` warnings | the same, or fewer warnings   |
| Tests                 | none (no runner)                               | `yarn test` passes, count > 0 |
| CI runs per PR branch | 2 (push and pull_request), about 1 min each    | 1                             |
| CI steps              | type-check, lint, format, validate             | plus tests and build          |

A report with other numbers needs explaining before it is accepted.

## How to execute (ship mode)

- **Per issue:** restate the acceptance criteria in 2–3 lines and give a
  plan of at most 8 steps in chat, then wait for Vlad's OK.
- **Stop after every PR:** after drafting the PR text, wait for approval
  to open it; after it is open, wait for Vlad's go-ahead to merge. Do not
  start the next issue on your own. This overrides any skill's default of
  continuing.
- **Branches:** one per issue, `git switch -c <type>/<slug> --no-track
origin/master`, then `git push -u origin <type>/<slug>`. Merges wait for
  Vlad.
- **Implementation** runs in the main session. Subagents only for broad
  searches, with the model sized as the user-level `CLAUDE.md` says.
- **Verify** with `yarn validate` (and `yarn test` once #32 lands) and
  report the counts from their own output; a pass with no counts is
  unverified. Then check the PR's CI run.
- **Reviews before the PR:** one whole-branch review by
  `task-reviewer-capable`, dispatched without `model`. Also a
  `security-reviewer` pass for #31, #33 and #34 (CI workflows) and #35
  (hooks). Re-check every claim a reviewer makes against the diff.
- **Posting:** draft PR text and any issue comment, show it, post only the
  approved text. No AI attribution anywhere: `settings.json` turns it off
  and a hook blocks it.
- **Repository settings** (the required check in #31, Dependabot security
  updates in #34) are Vlad's to change; give Vlad the exact steps.
- **The database:** no test, build or script may connect to it. Never run
  `prisma migrate` commands. The Prisma plugin is installed: its remote
  server can run SQL on production, so use it only for read-only lookups
  with Vlad's approval, and never use the local server's migrate tools.
- **The pre-commit hook in worktrees:** until #35 is fixed, a commit with
  staged `.ts`/`.tsx` files may fail with the ESLint patch error. Then run
  `yarn eslint --fix` and `yarn prettier --write` on the staged files
  yourself, commit with `HUSKY=0`, and say so in the PR.
- **Docs:** #31 and #32 make `CLAUDE.md`'s "No test suite" and "Node 20"
  lines stale, and #32 also makes `verify` in `.claude/workflow.json`
  stale (it will not run the new test command); fix them in the same PR.

## What comes next

After #31–#35: week 1 of the plan, #36 (backups, CSV export, a dev
database; Vlad does the Prisma Console and Vercel steps), then #37, #38,
#39. The shared-household spec (#40) follows and needs Vlad's approval
before #41 starts.

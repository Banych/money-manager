# Family-use plan

Decided 2026-11-11. Replaces "first paying user" as the goal for this
repository. Release, pricing or anything public is considered only after the
trial below passes its success test.

## Goal

Vlad and their partner use money-manager every week instead of reading their
bank apps, for a 4-week trial. Then decide: keep going, prepare a release, or
stop.

## Decisions (2026-11-11)

| Topic                | Decision                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Users                | Vlad and one partner. No kids, no wider family.                                              |
| Data model           | One shared household: one set of accounts and transactions, both see and edit everything.    |
| Devices              | One iPhone, one Android. Both must install and work.                                         |
| Language             | English only.                                                                                |
| Currencies           | Several. Totals shown separately per currency, no conversion, no exchange rates.             |
| Current tool         | Bank apps only, so there is no history to import.                                            |
| Jobs, in order       | 1. Log spending fast. 2. Plan purchases and meals. 3. See balances. 4. Monthly report.       |
| Plan purchases/meals | Shopping list plus recipes whose ingredients go onto the list. Built after the trial starts. |
| First target         | Start the trial in about one month, around 2026-12-09.                                       |
| Money type           | Move from `Float` to a decimal type, in the same migration as the household.                 |
| Tests and CI         | A test runner and CI/CD clean-up come first, as step 0, before week 1.                       |

The household model is a data-shape decision: issue 5 below writes its spec
before any code.

## Success test (at the end of the 4-week trial)

Both must hold:

1. **Habit:** each partner logged at least one transaction in each of the 4
   weeks. Measured with a read-only row count per author per week from the
   database; no analytics tool.
2. **Correct numbers:** at the end of the trial month, the app's totals per
   account and per currency match what the bank apps show.

Alongside, keep a written list of what annoyed the partner. It feeds the
decision but is not the test.

## Where the app stands (gap audit, 2026-11-11)

Code and docs reading only; nothing was run. Four claims were spot-checked in
code: the 20-row default page size, phone navigation hidden below 768px, the
future-date check running on server time, and the dashboard total taking 3
accounts.

| Job                        | State today                                                                                                                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Log spending on a phone    | Works, with friction: no navigation or "+" button below 768px, the modal may overflow a short screen, 5–8 taps, nothing remembered. Likely timezone bug: "now" can be rejected as "in the future" (unrun). |
| Plan purchases and meals   | Missing. No schema, routes or pages. The Groceries and Planned Purchases dashboard widgets show invented numbers.                                                                                          |
| See balances               | Works on `/accounts`. The dashboard total covers only the 3 most recently used accounts.                                                                                                                   |
| Monthly report by category | Missing. Nothing sums by category; the Analytics widget is a mock. The dashboard monthly totals can drop to the last 20 entries after any change (from code, unrun).                                       |
| Two people, one household  | Missing. Every query is scoped to one user. Sign-in is open to any verified Google account.                                                                                                                |
| Backups, export            | None in code. Provider backups unverified. The only database is production.                                                                                                                                |

The docs overclaimed: `docs/roadmap.md` marked recipes, planned purchases,
the goods database and analytics as done, and none of them exist.

## Milestone 1: start the trial (about 4 weeks, to ~2026-12-09)

Scope test for every task in this milestone: **does it block the trial?**
Sizes: S under a day, M a few days, L a week or more.

### Step 0: preparation (CI/CD and tests, 2–3 days)

From a comparison with bobrquiz's setup (2026-11-11, config reading only).
Bobrquiz runs Vitest (about 80 test files) and a build in CI, has Dependabot
and pins Node 22. Money-manager is ahead on its format and type checks in CI,
its pre-commit hook, and GitHub secret scanning, and keeps all of them.

**0a. CI workflow clean-up (S)**

- CI runs once per change: on pushes to `master` and on pull requests, not on
  both events for every branch (today each PR branch runs twice), with a
  concurrency group that cancels superseded runs.
- The duplicate `yarn validate` step (it repeats the three steps before it)
  is gone.
- Node is pinned in `.nvmrc` and CI uses the same major (22, as in bobrquiz;
  Vercel's Node setting is checked to match).
- The `Code Quality` check is required on `master` in the existing ruleset (a
  repository setting Vlad changes or approves).

**0b. Test runner (M)**

- Vitest with mocked database access only, following bobrquiz's pattern
  (mock the Prisma client with `vi.mock`). No test touches a real database
  until issue 1's dev database exists: bobrquiz's integration test falls back
  to `DATABASE_URL`, which here is production.
- First tests cover `src/lib/transactions/balance.ts`,
  `src/lib/callback-url.ts` and the transaction and account validators.
- `yarn test` runs in CI and its counts show in the run log.

**0c. Build in CI (S–M)**

- `yarn build` runs in CI with dummy `DATABASE_URL`, `NEXTAUTH_*` and
  `GOOGLE_*` values, after checking locally with the same dummy values that
  the build does not connect to a database.

**0d. Dependency updates (S)**

- `.github/dependabot.yml` adapted from bobrquiz: weekly npm updates grouped
  (Prisma, ESLint, Radix UI, TanStack, Vitest), major updates of Next and
  React ignored, GitHub Actions monthly.
- Dependabot security updates are switched on (a repository setting).
- The dead `changeset` script (no `@changesets/cli` installed) is removed.

**0e. Pre-commit hook in worktrees (S, time-boxed to half a day)**

- Find why lint-staged's `eslint --fix` fails in worktrees ("Failed to patch
  ESLint"). The likely source is `@rushstack/eslint-patch`, which
  `eslint-config-next` 15 loads (`index.js:53`); bobrquiz's version 16 does
  not. If the fix needs Next 16, park it and record that.

### Week 1: safe base

**1. Backups, export and a separate dev database (M)**

- The provider's backup status is confirmed and one restore has been done into
  a scratch database, with the steps written in `docs/`. Prisma Postgres'
  Free plan has no automated backups (Starter and Pro: daily, kept 7 days), so
  on Free this means a scheduled `pg_dump` or an upgrade.
- A signed-in user can download all their accounts and transactions as CSV.
- A local `.env` points at a non-production database; `CLAUDE.md`'s
  "one database" warning is updated to match.

**2. Remove fake and dead UI (S)**

- The Groceries, Planned Purchases and Analytics mock widgets are gone from
  the dashboard.
- "View Reports", "Account Settings" and the `/profile/…` link either work or
  are gone.
- The landing page and sign-in page claim only what exists (no "Coming Soon"
  on working features, no "share with family" until issue 6 lands).
- Unused mock helpers and the two 0-byte component files are deleted.

**3. Correct dates and totals (M)**

- An expense logged at local "now" is accepted from UTC+2 and from UTC−5, and
  shows the same wall-clock time after a reload and in the edit form.
- With more than 20 transactions in the month, the dashboard monthly totals
  stay correct after adding one.
- The dashboard balance total covers every account, one total per currency.

**4. Edit traps and error pages (S)**

- A transaction's description and category can be cleared; none is silently
  saved as "Other".
- A transaction can be moved to another account, and both balances are
  recomputed.
- A server error shows an error page with a retry, not Next's generic page.
- `POST /api/accounts` answers 400, not 500, to invalid input.

### Week 2: shared household

**5. Household spec (decision, S)**

- Covers: who owns an account (the household), who authored a transaction
  (the user), the migration of existing rows, and the sign-in allowlist.
- Includes moving money (`balance`, `openingBalance`, transaction `amount`)
  from `Float` to a decimal type in the same migration (decided 2026-11-11).
- Approved before issue 6 starts.

**6. Household implementation (L)**

- Only allowlisted emails can sign in; any other Google account sees a refusal.
- Both partners see and edit the same accounts and transactions.
- Each transaction shows who logged it.
- A backup is taken right before the migration, and row counts match before
  and after it.

### Week 3: phone first

**7. Fast entry on a phone (M)**

- At 375×667, navigation to dashboard, accounts and transactions and a
  persistent "+" button are visible.
- The add-transaction form fits the screen and scrolls; nothing is clipped.
- The amount field opens a decimal keypad and starts empty, not at 0.
- The last-used account and category are preselected; an expense with the
  defaults takes at most 4 taps plus typing the amount.
- Tap targets on the form and list rows are at least 44px.
- Switching between expense and income clears a category that doesn't belong.

**8. Installable on both phones (S–M)**

- A manifest and icons let the app be added to the home screen from Safari on
  the iPhone and Chrome on the Android, and it opens without browser chrome.
- Google sign-in works from the installed app on both phones (an unverified
  risk on iOS).

### Week 4: monthly report and dry run

**9. Monthly report by category (M)**

- A page shows the month's expense and income by category, per currency, with
  a month switch.
- Each total equals the sum of the transaction list for the same month and
  filter.
- A month with two currencies shows two totals, never one summed figure.
- Amounts show cents, with one formatter across the app.

**10. Dry run (S)**

- Both partners install the app, sign in and log 3 transactions each.
- Every problem found is either fixed or recorded with a decision.

## Milestone 2: the trial (4 weeks, ~2026-12-09 to ~2027-01-06)

- Both partners log for real. Fix what blocks logging first.
- In parallel, build the shared shopping list, then recipes whose ingredients
  add to the list. Each gets acceptance criteria when it starts.
- At the end, run the success test and decide: continue, prepare a release,
  or stop.

## Open questions for Vlad

1. **Which Prisma Postgres plan the workspace is on, and whether backups
   exist.** A second database costs nothing on any plan (Free allows 50,
   paid plans 1,000, per Prisma's pricing page on 2026-11-11), but Free has no
   automated backups. Checked by hand; the answer shapes issue 1.

Answered 2026-11-11: money moves to a decimal type in the household migration
(yes), and a test runner comes first as step 0, together with a CI/CD
clean-up compared against bobrquiz (yes). Both were parking-lot items that
Vlad moved in.

## How this maps to GitHub

Ship mode takes its scope from the current GitHub milestone. Proposed: a
milestone "Family M1: start the trial" due 2026-12-09 holding issues 0a–0e and 1–10, and
"Family M2: trial" for the trial fixes, shopping list and recipes. Issues and
milestones are posted as Vlad, so their text is drafted for approval first.

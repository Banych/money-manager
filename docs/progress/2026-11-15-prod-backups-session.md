# Session Log – 2026-11-15 (production backups)

## Session Focus: issue 1, backups

Issue 1 of `docs/family-plan.md` asks for backups and one restore into a
scratch database, with the steps in `docs/`. Two options were weighed: Prisma's
Starter plan ($10 a month, daily snapshots kept 7 days, self-serve restore) or
a nightly `pg_dump` from GitHub Actions (free, but a standing full-access
`prod` credential in GitHub secrets, and an encrypted dump, because the
repository is public and any signed-in GitHub user can download its
artifacts). Vlad chose Starter.

## What changed

- Vlad upgraded the Prisma workspace to Starter.
- `docs/backups.md`: what Prisma keeps, the backup list as observed, the
  restore drill, how a real restore would go, and what is still open.
- `scripts/count-rows.cjs`: one read-only `SELECT` printing row counts per
  table, the last migration and the last transaction update for the database
  in `DATABASE_URL`.
- `docs/family-plan.md` and `CLAUDE.md` now say where backups come from.

## Verified

- `prod`'s backup list, empty before the upgrade (also on 2026-11-11), showed
  a full backup from 2026-11-10 10:55 UTC and five increments up to
  2026-11-14 19:42 UTC after it.
- Backup `20261110-105539F_20261114-194213I` restored into
  `prod-restore-check-20261115`; `scripts/count-rows.cjs` (run by Vlad with
  temporary connection strings) printed identical output
  for both databases: 1 user, 1 account, 1 financial account, 0 sessions,
  1 transaction, 8 migrations, last migration 2026-11-10T11:45:27.139Z.
- The scratch database was deleted; `prod` and `nonprod` were `ready` after.
- `scripts/count-rows.cjs` against `nonprod`: exit 0.

## Not verified

- That the temporary connection string for `prod` was deleted after the count
  (the copy's went with the database).
- An in-place restore, and switching Production to a restored database.
- How the 7-day retention treats the 2026-11-10 full backup.
- Whether Starter can take a backup on demand (wanted before the household
  migration).
- Why the Free plan listed no backups, and why 2026-11-14 had three.

## Next

- CSV export, the last part of issue 1.

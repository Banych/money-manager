# Backups and restores

Production's database (`prod`, Prisma Postgres, project `money-manager`,
Frankfurt) is backed up by Prisma itself. The workspace moved from the Free
plan to Starter on 2026-11-15 for this; Free lists no backups. There is no
backup job in this repository.

## What Prisma keeps

Prisma's documentation (pricing page and
<https://www.prisma.io/docs/postgres/database/backups>, read 2026-11-15) says
Starter takes a daily snapshot on days the database had activity and keeps it
for 7 days, and that restores can go into a new database or over the existing
one.

What the backup list actually showed on 2026-11-15, right after the upgrade:

| Backup id                           | Type        | Taken (UTC)      |
| ----------------------------------- | ----------- | ---------------- |
| `20261110-105539F`                  | full        | 2026-11-10 10:55 |
| `20261110-105539F_20261110-134117I` | incremental | 2026-11-10 13:41 |
| `20261110-105539F_20261111-224337I` | incremental | 2026-11-11 22:43 |
| `20261110-105539F_20261114-133954I` | incremental | 2026-11-14 13:39 |
| `20261110-105539F_20261114-164338I` | incremental | 2026-11-14 16:43 |
| `20261110-105539F_20261114-194213I` | incremental | 2026-11-14 19:42 |

Two things in it differ from the documentation; the reason is unknown for
both:

- The same list was empty on the Free plan (2026-11-11 and the morning of
  2026-11-15), then showed history back to the database's creation once the
  plan changed.
- 2026-11-14 has three entries, not one.

Every entry is an increment on the 2026-11-10 full backup. How the 7-day
retention applies to that chain (whether the full backup or old increments
drop out after 2026-11-17) has not been seen yet.

## Restore drill (2026-11-15, passed)

The drill restores the newest backup into a new database, compares row
counts with `prod`, and deletes the copy. `prod` is not touched.

1. **List the backups.** Prisma Console → `money-manager` → `prod` →
   Backups, or the Prisma connector's `list_prisma_postgres_backups` with
   `prod`'s id (`db_a3ewa71t83z66ntqj5oqu42s`).
2. **Restore into a new database** named `prod-restore-check-<yyyymmdd>`:
   the console's restore action, or the connector's
   `create_prisma_postgres_recovery` with the backup id. On 2026-11-15 the
   copy of backup `…_20261114-194213I` went from `provisioning` to `ready`
   within about three minutes.
3. **Count rows in both databases.** For each one, create a connection string
   (database → **Connect to your database** → **Generate new connection
   string**, copy the direct one, note the last four characters of its
   password) and run, from the repository root in a terminal of your own:

   ```sh
   ( read -rs 'U?Connection string: ' && echo && DATABASE_URL=$U DIRECT_URL=$U node scripts/count-rows.cjs )
   ```

   `scripts/count-rows.cjs` runs one `SELECT` and prints a count per table,
   the last migration and the last transaction update. Then delete that
   connection string (database → **Connection strings**, find it by the four
   characters, confirm with `console-connection-string`): every credential
   has full read-write access.

4. **Compare.** The counts should match, except for rows written to `prod`
   after the backup was taken; `lastTransactionUpdate` shows whether any
   were.
5. **Delete the copy** (database settings, or the connector's
   `delete_prisma_postgres_database`). It holds production data.

Result on 2026-11-15, both databases identical:

| Table / value           | `prod`                   | restored copy            |
| ----------------------- | ------------------------ | ------------------------ |
| `User`                  | 1                        | 1                        |
| `Account`               | 1                        | 1                        |
| `FinancialAccount`      | 1                        | 1                        |
| `Session`               | 0                        | 0                        |
| `Transaction`           | 1                        | 1                        |
| `_prisma_migrations`    | 8                        | 8                        |
| `lastMigration`         | 2026-11-10T11:45:27.139Z | 2026-11-10T11:45:27.139Z |
| `lastTransactionUpdate` | 2026-11-10T11:05:48.191Z | 2026-11-10T11:05:48.191Z |

Traps seen in the drill:

- **The connector asks for an approval on every write and every SQL query**,
  read-only ones included. Each approval is granted in Prisma Console →
  workspace settings → Agents → Approvals, and expires about five minutes
  after the request.
- **The connector's `execute_sql_query` answered "Database not found"** for
  both `prod` and the restored copy, after the approval went through and with
  or without the `db_`/`proj_` prefixes. Why is unknown. Count rows locally,
  as in step 3.

## Restoring for real

Not exercised; assumed from the documentation:

- **Into a new database (preferred).** Restore as in the drill, check it,
  then point Vercel's Production `DATABASE_URL` and `DIRECT_URL` at a new
  credential of the restored database and redeploy. A changed variable needs a
  redeploy with the Ignored Build Step cleared (see `CLAUDE.md`, Config).
  Rows written to `prod` after the backup are not in the copy.
- **In place.** Overwrites `prod` with the backup and keeps its connection
  strings. Everything written after the backup is lost.

## Open

- Whether Starter can take a backup on demand. The household migration (issue
  6 of `docs/family-plan.md`) wants one right before it runs; until this is
  known, check that the newest backup is later than the last write, or take a
  `pg_dump` with PostgreSQL 17 tools over the direct connection.
- Point-in-time recovery is announced for November 2026 on the backups page.

// Prints the row count of every table, the last migration and the last
// transaction update for the database in DATABASE_URL. One read-only SELECT.
// Used to compare a restored backup with the database it came from
// (docs/backups.md). Run from the repository root.
const path = require('node:path');
const { PrismaClient } = require(
  path.join(__dirname, '..', 'src', 'generated', 'prisma')
);

const sql = `SELECT
  (SELECT count(*) FROM "User") AS "User",
  (SELECT count(*) FROM "Account") AS "Account",
  (SELECT count(*) FROM "FinancialAccount") AS "FinancialAccount",
  (SELECT count(*) FROM "Session") AS "Session",
  (SELECT count(*) FROM "Transaction") AS "Transaction",
  (SELECT count(*) FROM "_prisma_migrations") AS "_prisma_migrations",
  (SELECT max(finished_at) FROM "_prisma_migrations") AS "lastMigration",
  (SELECT max("updatedAt") FROM "Transaction") AS "lastTransactionUpdate"`;

const db = new PrismaClient();
db.$queryRawUnsafe(sql)
  .then(([row]) => {
    for (const [name, value] of Object.entries(row)) {
      console.log(
        name.padEnd(22),
        typeof value === 'bigint' ? Number(value) : value
      );
    }
  })
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

-- AlterTable
ALTER TABLE "FinancialAccount" ADD COLUMN     "openingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Backfill: openingBalance = balance - (income - expense), rounded to cents,
-- so every existing row satisfies balance = openingBalance + net.
-- Accounts with no transactions keep the default of 0 here and are set below.
UPDATE "FinancialAccount" AS a
SET "openingBalance" = ROUND((a."balance" - t."net")::numeric, 2)::double precision
FROM (
  SELECT "accountId",
         SUM(CASE WHEN "type" = 'INCOME' THEN "amount" ELSE -"amount" END) AS "net"
  FROM "Transaction"
  GROUP BY "accountId"
) AS t
WHERE t."accountId" = a."id";

-- Accounts with no transactions: the stored balance is the starting balance.
UPDATE "FinancialAccount" AS a
SET "openingBalance" = a."balance"
WHERE NOT EXISTS (SELECT 1 FROM "Transaction" t WHERE t."accountId" = a."id");

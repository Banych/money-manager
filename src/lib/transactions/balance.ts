import {
  Prisma,
  PrismaClient,
  Transaction,
  TransactionType,
} from '@/generated/prisma';

/** Round a money amount to cents, so float noise such as 1e-15 never reaches the database. */
export function roundToCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Income minus expense over all of an account's transactions (amounts are
 * stored positive). The account's balance is its openingBalance plus this.
 */
export async function getAccountNetTransactions(
  prisma: PrismaClient | Prisma.TransactionClient,
  accountId: string,
  userId: string
): Promise<number> {
  const aggregates = await prisma.transaction.groupBy({
    by: ['type'],
    where: { accountId, userId },
    _sum: { amount: true },
  });

  let income = 0;
  let expense = 0;
  for (const row of aggregates) {
    if (row.type === TransactionType.INCOME) income = row._sum.amount || 0;
    if (row.type === TransactionType.EXPENSE) expense = row._sum.amount || 0;
  }

  return income - expense;
}

/**
 * Lock the account row (SELECT ... FOR UPDATE) and return its openingBalance,
 * or null when the account does not exist or belongs to someone else.
 * Every write that derives balance or openingBalance from the transaction sums
 * calls this first, inside a Prisma transaction, so two such writes on one
 * account run one after the other and each reads the other's committed result.
 */
export async function lockAccountForBalanceWrite(
  prisma: PrismaClient | Prisma.TransactionClient,
  accountId: string,
  userId: string
): Promise<{ id: string; openingBalance: number } | null> {
  const rows = await prisma.$queryRaw<
    { id: string; openingBalance: number }[]
  >`SELECT "id", "openingBalance" FROM "FinancialAccount"
    WHERE "id" = ${accountId} AND "userId" = ${userId}
    FOR UPDATE`;
  return rows[0] ?? null;
}

/**
 * Recompute an account's balance (openingBalance + income - expense) and
 * lastActivity from all its transactions.
 * Use inside a Prisma transaction for consistency.
 */
export async function recomputeAccountBalance(
  prisma: PrismaClient | Prisma.TransactionClient,
  accountId: string,
  userId: string
) {
  const account = await lockAccountForBalanceWrite(prisma, accountId, userId);
  if (!account) {
    throw new Error('Account not found or access denied');
  }

  const net = await getAccountNetTransactions(prisma, accountId, userId);

  const latestTx = await prisma.transaction.findFirst({
    where: { accountId, userId },
    orderBy: { date: 'desc' },
    select: { date: true },
  });

  const balance = roundToCents(account.openingBalance + net);

  return prisma.financialAccount.update({
    where: { id: accountId, userId },
    data: { balance, lastActivity: latestTx?.date ?? null },
    select: { id: true, balance: true, lastActivity: true },
  });
}

/**
 * Validate transaction ownership and account access
 */
export async function validateTransactionAccess(
  prisma: PrismaClient | Prisma.TransactionClient,
  transactionId: string,
  userId: string
) {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
    select: { id: true, accountId: true, amount: true, type: true },
  });

  if (!transaction) {
    throw new Error('Transaction not found or access denied');
  }

  return transaction;
}

export type SimpleMonthlyBudget = {
  monthlyIncome: number;
  monthlyExpenses: number;
  primaryCurrency: string;
};

export const calculateSimpleMonthlyBudget = (
  transactions: (Transaction & { account: { currency: string } })[]
): SimpleMonthlyBudget => {
  let monthlyIncome = 0;
  let monthlyExpenses = 0;
  const currencyUsage: Record<string, number> = {};

  transactions.forEach((transaction) => {
    // Track currency usage
    const currency = transaction.account.currency;
    currencyUsage[currency] = (currencyUsage[currency] || 0) + 1;

    if (transaction.type === TransactionType.INCOME) {
      monthlyIncome += transaction.amount;
    } else if (transaction.type === TransactionType.EXPENSE) {
      monthlyExpenses += transaction.amount;
    }
  });

  // Determine the most frequently used currency
  let primaryCurrency: string;
  const currencyEntries = Object.entries(currencyUsage);
  if (currencyEntries.length === 0) {
    primaryCurrency = 'EUR'; // or any default currency you prefer
  } else {
    primaryCurrency = currencyEntries.reduce(
      (a, b) => (b[1] > a[1] ? b : a),
      ['', 0]
    )[0];
  }

  return { monthlyIncome, monthlyExpenses, primaryCurrency };
};

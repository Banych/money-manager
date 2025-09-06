import {
  Prisma,
  PrismaClient,
  Transaction,
  TransactionType,
} from '@/generated/prisma';

/**
 * Recompute an account's balance and lastActivity from all its transactions.
 * Use inside a Prisma transaction for consistency.
 */
export async function recomputeAccountBalance(
  prisma: PrismaClient | Prisma.TransactionClient,
  accountId: string,
  userId: string
) {
  // First verify the account exists and belongs to the user
  const account = await prisma.financialAccount.findUnique({
    where: { id: accountId, userId },
    select: { id: true },
  });

  if (!account) {
    throw new Error('Account not found or access denied');
  }

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

  const latestTx = await prisma.transaction.findFirst({
    where: { accountId, userId },
    orderBy: { date: 'desc' },
    select: { date: true },
  });

  const balance = income - expense; // amounts stored positive

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

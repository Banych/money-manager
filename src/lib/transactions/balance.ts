import { Prisma, PrismaClient, TransactionType } from '@/generated/prisma';

/**
 * Recompute an account's balance and lastActivity from all its transactions.
 * Use inside a Prisma transaction for consistency.
 */
export async function recomputeAccountBalance(
  prisma: PrismaClient | Prisma.TransactionClient,
  accountId: string,
  userId: string
) {
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

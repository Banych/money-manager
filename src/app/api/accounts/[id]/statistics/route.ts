import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await db.financialAccount.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true, balance: true, currency: true, lastActivity: true },
    });
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const prevMonthStart = startOfMonth(
      new Date(now.getFullYear(), now.getMonth() - 1, 1)
    );
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const currentMonth = await db.transaction.groupBy({
      by: ['type'],
      where: {
        accountId: id,
        userId: session.user.id,
        date: { gte: currentMonthStart },
      },
      _sum: { amount: true },
      _count: { _all: true },
    });
    const prevMonth = await db.transaction.groupBy({
      by: ['type'],
      where: {
        accountId: id,
        userId: session.user.id,
        date: { gte: prevMonthStart, lt: currentMonthStart },
      },
      _sum: { amount: true },
    });

    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    let txCount = 0;
    for (const row of currentMonth) {
      if (row.type === 'INCOME') monthlyIncome = row._sum.amount || 0;
      if (row.type === 'EXPENSE') monthlyExpenses = row._sum.amount || 0;
      txCount += row._count._all;
    }
    const netChange = monthlyIncome - monthlyExpenses;
    const averageTransaction = txCount
      ? (monthlyIncome + monthlyExpenses) / txCount
      : 0;

    let prevIncome = 0;
    let prevExpense = 0;
    for (const row of prevMonth) {
      if (row.type === 'INCOME') prevIncome = row._sum.amount || 0;
      if (row.type === 'EXPENSE') prevExpense = row._sum.amount || 0;
    }
    const prevNet = prevIncome - prevExpense;
    let trend: 'up' | 'down' | 'stable' = 'stable';
    let trendPercentage = 0;
    if (prevNet !== 0) {
      trendPercentage = ((netChange - prevNet) / Math.abs(prevNet)) * 100;
      if (trendPercentage > 1) trend = 'up';
      else if (trendPercentage < -1) trend = 'down';
      else trend = 'stable';
    } else if (netChange !== 0) {
      trend = 'up';
      trendPercentage = 100;
    }

    const txLast7 = await db.transaction.findMany({
      where: {
        accountId: id,
        userId: session.user.id,
        date: { gte: sevenDaysAgo },
      },
      orderBy: { date: 'asc' },
      select: { date: true, type: true, amount: true },
    });
    const priorAgg = await db.transaction.groupBy({
      by: ['type'],
      where: {
        accountId: id,
        userId: session.user.id,
        date: { lt: sevenDaysAgo },
      },
      _sum: { amount: true },
    });
    let priorIncome = 0;
    let priorExpense = 0;
    for (const row of priorAgg) {
      if (row.type === 'INCOME') priorIncome = row._sum.amount || 0;
      if (row.type === 'EXPENSE') priorExpense = row._sum.amount || 0;
    }
    let runningBalance = priorIncome - priorExpense;
    const balanceHistory: Array<{ date: string; balance: number }> = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(sevenDaysAgo);
      day.setDate(sevenDaysAgo.getDate() + i);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      for (const tx of txLast7) {
        if (tx.date >= day && tx.date <= dayEnd) {
          runningBalance += tx.type === 'INCOME' ? tx.amount : -tx.amount;
        }
      }
      balanceHistory.push({
        date: day.toISOString().split('T')[0],
        balance: runningBalance,
      });
    }

    let activityStatus: 'active' | 'low' | 'inactive' = 'inactive';
    if (account.lastActivity) {
      const diffDays = Math.floor(
        (now.getTime() - new Date(account.lastActivity).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (diffDays <= 7) activityStatus = 'active';
      else if (diffDays <= 30) activityStatus = 'low';
      else activityStatus = 'inactive';
    }

    return NextResponse.json({
      accountId: account.id,
      currency: account.currency,
      monthlyIncome,
      monthlyExpenses,
      netChange,
      trend,
      trendPercentage,
      transactionsCount: txCount,
      averageTransaction,
      balanceHistory,
      lastActivity: account.lastActivity,
      activityStatus,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to compute statistics' },
      { status: 500 }
    );
  }
}

import ExpensesIncomeWidgetHeaderContent from '@/components/dashboard/widgets/client-parts/expenses-income-widget-header';
import MonthlySummaryWidgetBlock from '@/components/dashboard/widgets/client-parts/monthly-summary-widget-block';
import RecentTransactionsWidgetBlock from '@/components/dashboard/widgets/client-parts/recent-transactions-widget-block';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TransactionType } from '@/generated/prisma';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Eye, Plus, Receipt } from 'lucide-react';
import Link from 'next/link';

export default async function ServerExpensesIncomeWidget() {
  const session = await getAuthSession();

  if (!session?.user) {
    return (
      <Card className="transition-shadow hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-green-600" />
            Expenses & Income
          </CardTitle>
          <CardDescription>
            Please sign in to view your transactions
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Get current month date range
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59
  );

  // Get transactions for current month and recent transactions in parallel
  const [monthlyTransactions, recentTransactions] = await Promise.all([
    // Get all transactions for current month to calculate statistics
    db.transaction.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            currency: true,
            type: true,
          },
        },
      },
    }),
    // Get 3 most recent transactions for display
    db.transaction.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            currency: true,
            type: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: 3,
    }),
  ]);

  // Calculate monthly statistics
  let monthlyIncome = 0;
  let monthlyExpenses = 0;
  const currencyUsage: Record<string, number> = {};

  monthlyTransactions.forEach((transaction) => {
    // Track currency usage
    const currency = transaction.account.currency;
    currencyUsage[currency] = (currencyUsage[currency] || 0) + 1;

    if (transaction.type === TransactionType.INCOME) {
      monthlyIncome += transaction.amount;
    } else if (transaction.type === TransactionType.EXPENSE) {
      monthlyExpenses += transaction.amount;
    }
  });

  // Determine primary currency (most used)
  const primaryCurrency = Object.keys(currencyUsage).reduce(
    (a, b) => (currencyUsage[a] > currencyUsage[b] ? a : b),
    'EUR'
  );

  const hasTransactions = monthlyTransactions.length > 0;

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <ExpensesIncomeWidgetHeaderContent
        initialTransactions={monthlyTransactions}
        userId={session.user.id}
        firstDayOfMonth={firstDayOfMonth}
        lastDayOfMonth={lastDayOfMonth}
      />

      <CardContent className="space-y-4">
        {hasTransactions ? (
          <>
            <MonthlySummaryWidgetBlock
              firstDayOfMonth={firstDayOfMonth}
              initialData={{ monthlyIncome, monthlyExpenses, primaryCurrency }}
              initialTransactions={monthlyTransactions}
              lastDayOfMonth={lastDayOfMonth}
              userId={session.user.id}
            />

            <RecentTransactionsWidgetBlock
              firstDayOfMonth={firstDayOfMonth}
              initialTransactions={recentTransactions}
              lastDayOfMonth={lastDayOfMonth}
              userId={session.user.id}
            />
          </>
        ) : (
          <div className="py-8 text-center">
            <Receipt className="mx-auto mb-2 h-12 w-12 text-gray-400" />
            <p className="mb-1 text-sm text-gray-500">No transactions yet</p>
            <p className="mb-4 text-xs text-gray-400">
              Add your first transaction to see financial insights
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            className="flex-1"
            asChild
          >
            <Link href="/transactions/new">
              <Plus className="mr-1 h-4 w-4" />
              Add Transaction
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            asChild
          >
            <Link href="/transactions">
              <Eye className="mr-1 h-4 w-4" />
              View All
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialAccount } from '@/generated/prisma';
import { cn } from '@/lib/utils';
import { ArrowDownIcon, ArrowUpIcon, TrendingUp } from 'lucide-react';
import {
  formatCurrency,
  generateAccountStatistics,
  generateMockTransactions,
} from './account-details-data';

interface AccountStatsProps {
  account: FinancialAccount;
}

export default function AccountStats({ account }: AccountStatsProps) {
  const transactions = generateMockTransactions(account.id, 30);
  const stats = generateAccountStatistics(account, transactions);

  return (
    <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Monthly Income */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.monthlyIncome, account.currency)}
          </div>
          <p className="text-muted-foreground text-xs">
            From{' '}
            {
              transactions.filter(
                (tx) =>
                  tx.type === 'income' &&
                  new Date(tx.date).getMonth() === new Date().getMonth()
              ).length
            }{' '}
            transactions
          </p>
        </CardContent>
      </Card>

      {/* Monthly Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Monthly Expenses
          </CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(stats.monthlyExpenses, account.currency)}
          </div>
          <p className="text-muted-foreground text-xs">
            From{' '}
            {
              transactions.filter(
                (tx) =>
                  tx.type === 'expense' &&
                  new Date(tx.date).getMonth() === new Date().getMonth()
              ).length
            }{' '}
            transactions
          </p>
        </CardContent>
      </Card>

      {/* Net Change */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Change</CardTitle>
          <TrendingUp
            className={cn(
              'h-4 w-4',
              stats.netChange >= 0 ? 'text-green-600' : 'text-red-600'
            )}
          />
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'text-2xl font-bold',
              stats.netChange >= 0 ? 'text-green-600' : 'text-red-600'
            )}
          >
            {formatCurrency(stats.netChange, account.currency)}
          </div>
          <p className="text-muted-foreground text-xs">
            {stats.netChange >= 0 ? 'Positive' : 'Negative'} cash flow this
            month
          </p>
        </CardContent>
      </Card>

      {/* Balance History Chart Placeholder */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Balance History (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.balanceHistory.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b py-2 last:border-b-0"
              >
                <span className="text-muted-foreground text-sm">
                  {entry.date.toLocaleDateString('en-GB', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span
                  className={cn(
                    'font-medium',
                    entry.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {formatCurrency(entry.balance, account.currency)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

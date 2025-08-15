'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FinancialAccount } from '@/generated/prisma';
import { useAccountStatistics } from '@/hooks/useAccountStatistics';
import { dayjs } from '@/lib/date';
import { cn } from '@/lib/utils';
import { ArrowDownIcon, ArrowUpIcon, TrendingUp } from 'lucide-react';
import { formatCurrency } from './account-details-data';

interface AccountStatsProps {
  account: FinancialAccount;
}

export default function AccountStats({ account }: AccountStatsProps) {
  const { data: stats, isLoading, isError } = useAccountStatistics(account.id);

  if (isLoading) {
    return (
      <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border p-4"
          >
            <Skeleton className="mb-4 h-4 w-24" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-2 h-3 w-40" />
          </div>
        ))}
        <div className="rounded-lg border p-6 md:col-span-2 lg:col-span-3">
          <Skeleton className="mb-4 h-4 w-48" />
          <div className="space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-6 w-full"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !stats) return null;

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
          <p className="text-muted-foreground text-xs">From - transactions</p>
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
          <p className="text-muted-foreground text-xs">From - transactions</p>
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
                  {dayjs(entry.date).format('ddd, DD MMM')}
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

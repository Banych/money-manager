'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  accountTypeIcons,
  accountTypeLabels,
  formatBalance,
} from '@/constants/accounts';
import { FinancialAccount } from '@/generated/prisma';
import { useAccount } from '@/hooks/useAccounts';
import { useAccountStatistics } from '@/hooks/useAccountStatistics';
import { formatISO } from '@/lib/date';
import { cn } from '@/lib/utils';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Calendar,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { formatLastActivity } from './account-insights';

interface AccountOverviewProps {
  account: FinancialAccount;
}

export default function AccountOverview({ account }: AccountOverviewProps) {
  const { data: accountData, isLoading: isLoadingAccount } = useAccount(
    account.id,
    account
  );
  const { data: stats, isLoading: isLoadingStats } = useAccountStatistics(
    account.id
  );
  const Icon = accountTypeIcons[accountData?.type || account.type];
  const isNegative = (accountData?.balance || account.balance) < 0;

  return (
    <Card className="mb-6">
      {isLoadingAccount ? (
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
      ) : (
        <CardHeader>
          <div className="flex flex-row flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                <Icon className="text-primary h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {accountData?.name || account.name}
                </CardTitle>
                <div className="mt-1 flex items-center space-x-2">
                  <Badge
                    variant="outline"
                    className="text-xs"
                  >
                    {accountTypeLabels[accountData?.type || account.type]}
                  </Badge>
                  {accountData?.lastActivity && (
                    <Badge
                      variant="outline"
                      className="text-xs"
                    >
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground text-sm">
                Created {formatISO(accountData?.createdAt || account.createdAt)}
              </span>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="space-y-6">
        {/* Main Balance */}
        <div className="text-center">
          <div
            className={cn(
              'mb-2 text-4xl font-bold',
              isNegative ? 'text-red-600' : 'text-green-600'
            )}
          >
            {accountData
              ? formatBalance(accountData.balance, accountData.currency)
              : formatBalance(account.balance, account.currency)}
          </div>
          <div className="flex items-center justify-center space-x-2">
            {isLoadingStats ? (
              <Skeleton className="h-5 w-40" />
            ) : (
              stats &&
              (stats.netChange >= 0 ? (
                <div
                  className={cn('flex items-center space-x-1 text-green-600')}
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">
                    +{stats.trendPercentage.toFixed(1)}% this month
                  </span>
                </div>
              ) : (
                <div className={cn('flex items-center space-x-1 text-red-600')}>
                  <TrendingDown className="h-4 w-4" />
                  <span className="font-medium">
                    {stats.trendPercentage.toFixed(1)}% this month
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Credit Card Utilization */}
        {/* Credit utilization widget will render here once real data is available */}

        {/* Quick Stats */}
        {isLoadingStats ? (
          <div className="grid grid-cols-2 gap-4">
            {/* Skeleton for each stat box */}
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-muted/50 flex flex-col items-center justify-center rounded-lg p-2 text-center"
              >
                <Skeleton className="mb-2 h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : (
          stats && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg p-2 text-center">
                <div className="text-primary text-2xl font-bold">
                  {stats.transactionsCount}
                </div>
                <div className="text-muted-foreground text-sm">
                  Transactions this month
                </div>
              </div>
              <div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg p-2 text-center">
                <div className="text-primary text-2xl font-bold">
                  {formatBalance(
                    stats.averageTransaction,
                    accountData?.currency || account.currency
                  )}
                </div>
                <div className="text-muted-foreground text-sm">
                  Average transaction
                </div>
              </div>
              <div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg p-2 text-center">
                <div className="text-primary text-2xl font-bold">
                  {formatBalance(
                    stats.monthlyIncome,
                    accountData?.currency || account.currency
                  )}
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  Monthly income
                  <ArrowUpIcon className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg p-2 text-center">
                <div className="text-primary text-2xl font-bold">
                  {formatBalance(
                    stats.monthlyExpenses,
                    accountData?.currency || account.currency
                  )}
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  Monthly expenses
                  <ArrowDownIcon className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </div>
          )
        )}

        {/* Last Activity */}
        <div className="text-muted-foreground text-center text-sm">
          {isLoadingStats ? (
            <Skeleton className="mx-auto h-4 w-32" />
          ) : accountData?.lastActivity ? (
            formatLastActivity(new Date(accountData.lastActivity))
          ) : account.lastActivity ? (
            formatLastActivity(new Date(account.lastActivity))
          ) : (
            'No activity yet'
          )}
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import { formatLastActivity } from './account-insights';

interface AccountOverviewProps {
  account: FinancialAccount;
}

export default function AccountOverview({ account }: AccountOverviewProps) {
  const { data: accountData } = useAccount(account.id, account);
  const { data: stats } = useAccountStatistics(account.id);
  const Icon = accountTypeIcons[accountData?.type || account.type];
  const isNegative = (accountData?.balance || account.balance) < 0;

  return (
    <Card className="mb-6">
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
            {stats &&
              // need to change it to percentage of net change to previous month
              // to show how nuch is current cash related to previous end of month
              (stats.netChange >= 0 ? (
                <div
                  className={cn('flex items-center space-x-1 text-green-600')}
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">
                    +
                    {formatBalance(
                      stats.netChange,
                      accountData?.currency || account.currency
                    )}{' '}
                    this month
                  </span>
                </div>
              ) : (
                <div className={cn('flex items-center space-x-1 text-red-600')}>
                  <TrendingDown className="h-4 w-4" />
                  <span className="font-medium">
                    {formatBalance(
                      stats.netChange,
                      accountData?.currency || account.currency
                    )}{' '}
                    this month
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Credit Card Utilization */}
        {/* Credit utilization widget will render here once real data is available */}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          {stats && (
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-primary text-2xl font-bold">
                {stats.transactionsCount}
              </div>
              <div className="text-muted-foreground text-sm">
                Transactions this month
              </div>
            </div>
          )}
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-primary text-2xl font-bold">
              {stats
                ? formatBalance(
                    stats.averageTransaction,
                    accountData?.currency || account.currency
                  )
                : '—'}
            </div>
            <div className="text-muted-foreground text-sm">
              Average transaction
            </div>
          </div>
        </div>

        {/* Last Activity */}
        <div className="text-muted-foreground text-center text-sm">
          {accountData?.lastActivity
            ? formatLastActivity(new Date(accountData.lastActivity))
            : account.lastActivity
              ? formatLastActivity(new Date(account.lastActivity))
              : 'No activity yet'}
        </div>
      </CardContent>
    </Card>
  );
}

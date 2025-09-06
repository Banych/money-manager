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
import { useAccountStatistics } from '@/hooks/useAccountStatistics';
import { cn } from '@/lib/utils';
import {
  formatLastActivity,
  getActivityStatusDisplay,
  getTrendDisplay,
} from './account-insights';

interface AccountCardProps {
  account: FinancialAccount;
  onClick?: () => void;
}

export default function AccountCard({ account, onClick }: AccountCardProps) {
  const Icon = accountTypeIcons[account.type];
  const isNegative = account.balance < 0;
  const { data: stats, isLoading } = useAccountStatistics(account.id);
  const activityStatus = getActivityStatusDisplay(stats?.activityStatus);
  const trendDisplay = getTrendDisplay(stats?.trend);

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:-translate-y-1 hover:shadow-lg',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-2">
          <CardTitle className="truncate text-sm font-medium">
            {account.name}
          </CardTitle>
          {isLoading ? (
            <Skeleton className="h-5.5 w-18" />
          ) : (
            <Badge
              variant={activityStatus.variant}
              className={cn('text-xs', activityStatus.className)}
            >
              {activityStatus.label}
            </Badge>
          )}
        </div>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Balance */}
        <div className="flex items-center justify-between">
          <div className="flex flex-1 flex-col">
            <div
              className={cn(
                'text-2xl font-bold',
                isNegative ? 'text-red-600' : 'text-green-600'
              )}
            >
              {formatBalance(account.balance, account.currency)}
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className="text-xs"
              >
                {accountTypeLabels[account.type]}
              </Badge>
              {isLoading ? (
                <Skeleton className="h-4 w-10" />
              ) : (
                stats && (
                  <div
                    className={cn(
                      'flex items-center space-x-1 text-xs',
                      trendDisplay.color
                    )}
                  >
                    <span>{trendDisplay.icon}</span>
                    <span>{stats.trendPercentage.toFixed(1)}%</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Credit utilization omitted until backend supports credit limits */}

        {/* Activity Info */}
        <div className="space-y-1">
          <div className="text-muted-foreground text-xs">
            {isLoading ? (
              <Skeleton className="h-3 w-20" />
            ) : stats?.lastActivity ? (
              formatLastActivity(new Date(stats.lastActivity))
            ) : (
              'No recent activity'
            )}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-3 w-24" />
              ) : (
                `${stats?.transactionsCount ?? 0} transactions this month`
              )}
            </span>
            <span className="text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-3 w-16" />
              ) : (
                <>
                  {'Avg: '}
                  {formatBalance(
                    stats?.averageTransaction || 0,
                    account.currency
                  )}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Monthly activity progress removed until endpoint supplies target */}
      </CardContent>
    </Card>
  );
}

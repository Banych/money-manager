'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  accountTypeIcons,
  accountTypeLabels,
  formatBalance,
} from '@/constants/accounts';
import { FinancialAccount } from '@/generated/prisma';
import { cn } from '@/lib/utils';
import {
  formatLastActivity,
  generateAccountInsights,
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
  const insights = generateAccountInsights(account.id, account.type);
  const activityStatus = getActivityStatusDisplay(insights.activityStatus);
  const trendDisplay = getTrendDisplay(insights.trend);

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
          <Badge
            variant={activityStatus.variant}
            className={cn('text-xs', activityStatus.className)}
          >
            {activityStatus.label}
          </Badge>
        </div>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Balance */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div
              className={cn(
                'text-2xl font-bold',
                isNegative ? 'text-red-600' : 'text-green-600'
              )}
            >
              {formatBalance(account.balance, account.currency)}
            </div>
            <div className="mt-1 flex items-center space-x-2">
              <Badge
                variant="secondary"
                className="text-xs"
              >
                {accountTypeLabels[account.type]}
              </Badge>
              <div
                className={cn(
                  'flex items-center space-x-1 text-xs',
                  trendDisplay.color
                )}
              >
                <span>{trendDisplay.icon}</span>
                <span>{insights.trendPercentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Card Utilization */}
        {insights.utilization && (
          <div className="space-y-2">
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>Credit Utilization</span>
              <span>
                {formatBalance(insights.utilization.used, account.currency)} /
                {formatBalance(insights.utilization.limit, account.currency)}
              </span>
            </div>
            <Progress
              value={
                (insights.utilization.used / insights.utilization.limit) * 100
              }
              className="h-2"
            />
          </div>
        )}

        {/* Activity Info */}
        <div className="space-y-1">
          <div className="text-muted-foreground text-xs">
            {formatLastActivity(insights.lastActivity)}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {insights.monthlyTransactions} transactions this month
            </span>
            <span className="text-muted-foreground">
              Avg:{' '}
              {formatBalance(insights.averageTransaction, account.currency)}
            </span>
          </div>
        </div>

        {/* Activity Progress Bar */}
        <div className="space-y-1">
          <Progress
            value={Math.min((insights.monthlyTransactions / 25) * 100, 100)}
            className="h-1"
          />
          <div className="text-muted-foreground text-center text-xs">
            Monthly Activity
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

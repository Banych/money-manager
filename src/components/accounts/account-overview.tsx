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
import { Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import {
  formatLastActivity,
  generateAccountInsights,
  getActivityStatusDisplay,
  getTrendDisplay,
} from './account-insights';

interface AccountOverviewProps {
  account: FinancialAccount;
}

export default function AccountOverview({ account }: AccountOverviewProps) {
  const Icon = accountTypeIcons[account.type];
  const isNegative = account.balance < 0;
  const insights = generateAccountInsights(account.id, account.type);
  const activityStatus = getActivityStatusDisplay(insights.activityStatus);
  const trendDisplay = getTrendDisplay(insights.trend);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
              <Icon className="text-primary h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">{account.name}</CardTitle>
              <div className="mt-1 flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className="text-xs"
                >
                  {accountTypeLabels[account.type]}
                </Badge>
                <Badge
                  variant={activityStatus.variant}
                  className={cn('text-xs', activityStatus.className)}
                >
                  {activityStatus.label}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground text-sm">
                Created {account.createdAt.toLocaleDateString()}
              </span>
            </div>
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
            {formatBalance(account.balance, account.currency)}
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div
              className={cn('flex items-center space-x-1', trendDisplay.color)}
            >
              {insights.trend === 'up' && <TrendingUp className="h-4 w-4" />}
              {insights.trend === 'down' && (
                <TrendingDown className="h-4 w-4" />
              )}
              {insights.trend === 'stable' && (
                <span className="text-lg">→</span>
              )}
              <span className="font-medium">
                {insights.trendPercentage.toFixed(1)}% this month
              </span>
            </div>
          </div>
        </div>

        {/* Credit Card Utilization */}
        {insights.utilization && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Credit Utilization</h3>
              <span className="text-muted-foreground text-sm">
                {(
                  (insights.utilization.used / insights.utilization.limit) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
            <div className="space-y-2">
              <Progress
                value={
                  (insights.utilization.used / insights.utilization.limit) * 100
                }
                className="h-3"
              />
              <div className="text-muted-foreground flex justify-between text-sm">
                <span>
                  Used:{' '}
                  {formatBalance(insights.utilization.used, account.currency)}
                </span>
                <span>
                  Limit:{' '}
                  {formatBalance(insights.utilization.limit, account.currency)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-primary text-2xl font-bold">
              {insights.monthlyTransactions}
            </div>
            <div className="text-muted-foreground text-sm">
              Transactions this month
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-primary text-2xl font-bold">
              {formatBalance(insights.averageTransaction, account.currency)}
            </div>
            <div className="text-muted-foreground text-sm">
              Average transaction
            </div>
          </div>
        </div>

        {/* Last Activity */}
        <div className="text-muted-foreground text-center text-sm">
          {formatLastActivity(insights.lastActivity)}
        </div>
      </CardContent>
    </Card>
  );
}

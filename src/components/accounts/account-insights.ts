import { FinancialAccountType } from '@/generated/prisma';

export type ActivityStatus = 'active' | 'low' | 'inactive';
export type BalanceTrend = 'up' | 'down' | 'stable';

export interface AccountInsights {
  lastActivity: Date;
  monthlyTransactions: number;
  trend: BalanceTrend;
  trendPercentage: number;
  utilization?: {
    used: number;
    limit: number;
  };
  activityStatus: ActivityStatus;
  averageTransaction: number;
}

/**
 * Generate mock account insights for preview
 */
export function generateAccountInsights(
  accountId: string,
  accountType: FinancialAccountType
): AccountInsights {
  // Use account ID for consistent mock data
  const seed = accountId
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Generate last activity (0-30 days ago)
  const daysAgo = (seed % 30) + 1;
  const lastActivity = new Date();
  lastActivity.setDate(lastActivity.getDate() - daysAgo);

  // Generate monthly transactions (2-25)
  const monthlyTransactions = (seed % 24) + 2;

  // Generate trend
  const trendOptions: BalanceTrend[] = ['up', 'down', 'stable'];
  const trend = trendOptions[seed % 3];
  const trendPercentage = ((seed % 20) + 1) / 10; // 0.1 to 2.0%

  // Generate activity status based on last activity
  const activityStatus: ActivityStatus =
    daysAgo <= 7 ? 'active' : daysAgo <= 30 ? 'low' : 'inactive';

  // Generate average transaction amount (10-150)
  const averageTransaction = (seed % 140) + 10;

  // Generate utilization for credit cards
  const utilization =
    accountType === FinancialAccountType.CREDIT_CARD
      ? {
          used: (seed % 3000) + 500, // 500-3500
          limit: (seed % 2000) + 3000, // 3000-5000
        }
      : undefined;

  return {
    lastActivity,
    monthlyTransactions,
    trend,
    trendPercentage,
    utilization,
    activityStatus,
    averageTransaction,
  };
}

/**
 * Format last activity for display
 */
export function formatLastActivity(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Used yesterday';
  if (diffDays < 7) return `Used ${diffDays} days ago`;
  if (diffDays < 30) return `Used ${Math.ceil(diffDays / 7)} weeks ago`;
  return 'No recent activity';
}

/**
 * Get trend icon and color
 */
export function getTrendDisplay(trend: BalanceTrend) {
  switch (trend) {
    case 'up':
      return { icon: '↗️', color: 'text-green-600', bgColor: 'bg-green-50' };
    case 'down':
      return { icon: '↘️', color: 'text-red-600', bgColor: 'bg-red-50' };
    case 'stable':
      return { icon: '➡️', color: 'text-gray-600', bgColor: 'bg-gray-50' };
  }
}

/**
 * Get activity status display
 * TODO: refactor it later (we might have separate component for it)
 */
export function getActivityStatusDisplay(status: ActivityStatus) {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 hover:bg-green-100',
      };
    case 'low':
      return {
        label: 'Low Activity',
        variant: 'secondary' as const,
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      };
    case 'inactive':
      return {
        label: 'Inactive',
        variant: 'outline' as const,
        className: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
      };
  }
}

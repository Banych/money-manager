import { useQuery } from '@tanstack/react-query';

export interface AccountStatisticsResponse {
  accountId: string;
  currency: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  netChange: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  transactionsCount: number;
  averageTransaction: number;
  balanceHistory: { date: string; balance: number }[];
  lastActivity: string | null;
  activityStatus: 'active' | 'low' | 'inactive';
}

export const accountStatisticsKeys = {
  all: ['account-statistics'] as const,
  detail: (accountId: string) => ['account-statistics', accountId] as const,
};

async function fetchAccountStatistics(
  accountId: string
): Promise<AccountStatisticsResponse> {
  const res = await fetch(`/api/accounts/${accountId}/statistics`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch account statistics');
  return res.json();
}

export function useAccountStatistics(accountId?: string, enabled = true) {
  return useQuery({
    queryKey: accountId
      ? accountStatisticsKeys.detail(accountId)
      : accountStatisticsKeys.all,
    queryFn: () => fetchAccountStatistics(accountId as string),
    enabled: !!accountId && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

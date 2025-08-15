import { Transaction, TransactionType } from '@/generated/prisma';
import { useQuery } from '@tanstack/react-query';

export const transactionsKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionsKeys.all, 'list'] as const,
  list: (accountId: string, params: Record<string, unknown>) =>
    [...transactionsKeys.lists(), { accountId, ...params }] as const,
  account: (accountId: string) =>
    [...transactionsKeys.all, 'account', accountId] as const,
  detail: (id: string) => [...transactionsKeys.all, 'detail', id] as const,
};

export interface UseTransactionsOptions {
  page?: number;
  limit?: number;
  type?: TransactionType;
  category?: string;
  from?: Date;
  to?: Date;
  enabled?: boolean;
}

export interface TransactionsListResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

async function fetchAccountTransactions(
  accountId: string,
  params: UseTransactionsOptions
): Promise<TransactionsListResponse> {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.type) search.set('type', params.type);
  if (params.category) search.set('category', params.category);
  if (params.from) search.set('from', params.from.toISOString());
  if (params.to) search.set('to', params.to.toISOString());

  const res = await fetch(
    `/api/accounts/${accountId}/transactions?${search.toString()}`
  );
  if (!res.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return res.json();
}

export function useTransactions(
  accountId: string,
  options: UseTransactionsOptions = {}
) {
  return useQuery({
    // Spread only defined primitives into key to avoid unstable refs
    queryKey: transactionsKeys.list(accountId, {
      page: options.page,
      limit: options.limit,
      type: options.type,
      category: options.category,
      from: options.from?.toISOString(),
      to: options.to?.toISOString(),
    } as Record<string, unknown>),
    queryFn: () => fetchAccountTransactions(accountId, options),
    enabled: !!accountId && (options.enabled ?? true),
    staleTime: 60_000,
  });
}

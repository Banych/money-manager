import { formatCurrency } from '@/components/accounts/account-details-data';
import { Transaction, TransactionType } from '@/generated/prisma';
import { accountsKeys } from '@/hooks/useAccounts';
import { accountStatisticsKeys } from '@/hooks/useAccountStatistics';
import { CreateTransactionData } from '@/lib/validators/transaction.validator';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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

// Create transaction request
async function createTransaction(
  data: CreateTransactionData
): Promise<Transaction> {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create transaction');
  }
  return response.json();
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: (newTransaction, variables) => {
      // Invalidate account list (balance, lastActivity, etc.)
      queryClient.invalidateQueries({ queryKey: accountsKeys.lists() });
      // Invalidate transactions lists (all variations)
      queryClient.invalidateQueries({ queryKey: transactionsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: accountsKeys.detail(newTransaction.accountId),
      });
      // Invalidate statistics for that account
      queryClient.invalidateQueries({
        queryKey: accountStatisticsKeys.detail(variables.accountId),
      });

      toast.success(
        `${variables.type === 'INCOME' ? 'Income' : 'Expense'} of ${formatCurrency(variables.amount, 'EUR')} added.`
      );
      router.push(`/transactions/${newTransaction.id}`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create transaction'
      );
    },
  });
}

// Refresh helper
export function useRefreshTransactions() {
  const queryClient = useQueryClient();
  return (accountId?: string) => {
    queryClient.invalidateQueries({ queryKey: transactionsKeys.lists() });
    if (accountId) {
      queryClient.invalidateQueries({
        queryKey: transactionsKeys.account(accountId),
      });
      queryClient.invalidateQueries({
        queryKey: accountStatisticsKeys.detail(accountId),
      });
    }
    queryClient.invalidateQueries({ queryKey: accountsKeys.lists() });
  };
}

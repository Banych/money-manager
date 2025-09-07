import { formatCurrency } from '@/components/accounts/account-details-data';
import { Transaction, TransactionType } from '@/generated/prisma';
import { accountsKeys } from '@/hooks/useAccounts';
import { accountStatisticsKeys } from '@/hooks/useAccountStatistics';
import { TransactionWithAccount } from '@/lib/db';
import {
  CreateTransactionData,
  EditTransactionData,
} from '@/lib/validators/transaction.validator';
import {
  QueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

export const transactionsKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionsKeys.all, 'list'] as const,
  list: (accountId: string, params: Record<string, unknown>) =>
    [...transactionsKeys.lists(), { accountId, ...params }] as const,
  globalList: (params: Record<string, unknown>) =>
    [...transactionsKeys.lists(), 'global', params] as const,
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
  userId?: string;
}

export interface TransactionsListResponse {
  data: (Transaction & {
    account: {
      id: string;
      name: string;
      currency: string;
      type: string;
    };
  })[];
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

async function fetchAllTransactions(
  params: UseTransactionsOptions
): Promise<TransactionsListResponse> {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.type) search.set('type', params.type);
  if (params.category) search.set('category', params.category);
  if (params.from) search.set('from', params.from.toISOString());
  if (params.to) search.set('to', params.to.toISOString());

  const res = await fetch(`/api/transactions?${search.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return res.json();
}

export function useAccountTransactions(
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

export function useAllTransactions(
  options: UseTransactionsOptions = {},
  queryInitialOptions: QueryOptions<TransactionsListResponse, Error> = {}
) {
  return useQuery({
    queryKey: transactionsKeys.globalList({
      page: options.page,
      limit: options.limit,
      type: options.type,
      category: options.category,
      from: options.from?.toISOString(),
      to: options.to?.toISOString(),
      userId: options.userId,
    } as Record<string, unknown>),
    queryFn: () => fetchAllTransactions(options),
    enabled: options.enabled ?? true,
    staleTime: 60_000,
    ...queryInitialOptions,
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

// Get single transaction
async function fetchTransaction(id: string): Promise<TransactionWithAccount> {
  const response = await fetch(`/api/transactions/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch transaction');
  }
  return response.json();
}

export function useTransaction(
  id: string,
  enabled = true,
  queryInitialOptions: QueryOptions<TransactionWithAccount, Error> = {}
) {
  return useQuery({
    queryKey: transactionsKeys.detail(id),
    queryFn: () => fetchTransaction(id),
    enabled: !!id && enabled,
    staleTime: 60_000,
    ...queryInitialOptions,
  });
}

// Update transaction request
async function updateTransaction(
  data: EditTransactionData
): Promise<Transaction> {
  const { id, ...updateData } = data;
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update transaction');
  }
  return response.json();
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTransaction,
    onSuccess: (updatedTransaction) => {
      // Invalidate and update related queries
      queryClient.invalidateQueries({ queryKey: accountsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: accountsKeys.detail(updatedTransaction.accountId),
      });
      queryClient.invalidateQueries({
        queryKey: accountStatisticsKeys.detail(updatedTransaction.accountId),
      });
      queryClient.setQueryData(
        transactionsKeys.detail(updatedTransaction.id),
        updatedTransaction
      );

      toast.success('Transaction updated successfully');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update transaction'
      );
    },
  });
}

// Delete transaction request
async function deleteTransaction(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete transaction');
  }
  return response.json();
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: (_, deletedId) => {
      // Get transaction data from cache before removing it
      const transaction = queryClient.getQueryData(
        transactionsKeys.detail(deletedId)
      ) as Transaction | undefined;

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: accountsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionsKeys.lists() });

      if (transaction) {
        queryClient.invalidateQueries({
          queryKey: accountsKeys.detail(transaction.accountId),
        });
        queryClient.invalidateQueries({
          queryKey: accountStatisticsKeys.detail(transaction.accountId),
        });
      }

      // Remove the deleted transaction from cache
      queryClient.removeQueries({
        queryKey: transactionsKeys.detail(deletedId),
      });

      toast.success('Transaction deleted successfully');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete transaction'
      );
    },
  });
}

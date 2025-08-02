import { formatCurrency } from '@/components/accounts/account-details-data';
import { Transaction } from '@/generated/prisma';
import { CreateTransactionData } from '@/lib/validators/transaction.validator';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Query keys for consistent cache management
export const transactionsKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionsKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...transactionsKeys.lists(), { filters }] as const,
  details: () => [...transactionsKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionsKeys.details(), id] as const,
  account: (accountId: string) =>
    [...transactionsKeys.all, 'account', accountId] as const,
};

// Account keys (imported for cache invalidation)
export const accountsKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountsKeys.all, 'list'] as const,
};

// Create transaction
async function createTransaction(
  data: CreateTransactionData
): Promise<Transaction> {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create transaction');
  }

  return response.json();
}

// Hook for creating transactions
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransaction,
    onSuccess: (newTransaction, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: accountsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: transactionsKeys.account(variables.accountId),
      });

      // Also invalidate account stats if they exist
      queryClient.invalidateQueries({
        queryKey: ['account-stats', variables.accountId],
      });

      // Show success toast
      toast.success(
        `${variables.type === 'INCOME' ? 'Income' : 'Expense'} of ${formatCurrency(variables.amount, 'EUR')} added successfully!`
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create transaction'
      );
    },
  });
}

// Hook for transaction operations that need to refresh lists
export function useRefreshTransactions() {
  const queryClient = useQueryClient();

  return (accountId?: string) => {
    queryClient.invalidateQueries({ queryKey: transactionsKeys.lists() });
    if (accountId) {
      queryClient.invalidateQueries({
        queryKey: transactionsKeys.account(accountId),
      });
    }
    queryClient.invalidateQueries({ queryKey: accountsKeys.lists() });
  };
}

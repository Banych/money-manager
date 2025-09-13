import { FinancialAccount } from '@/generated/prisma';
import { UpdateAccountData } from '@/lib/validators/account.validator';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { accountStatisticsKeys } from './useAccountStatistics';
import { transactionsKeys } from './useTransactions';

// Query keys for consistent cache management
export const accountsKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountsKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...accountsKeys.lists(), { filters }] as const,
  details: () => [...accountsKeys.all, 'detail'] as const,
  detail: (id: string) => [...accountsKeys.details(), id] as const,
};

// Fetch accounts
async function fetchAccounts(): Promise<FinancialAccount[]> {
  const response = await fetch('/api/accounts');
  if (!response.ok) {
    throw new Error('Failed to fetch accounts');
  }
  return response.json();
}

// Create account
async function createAccount(data: {
  name: string;
  balance: number;
  currency: string;
  type: string;
}): Promise<FinancialAccount> {
  const response = await fetch('/api/accounts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create account');
  }

  return response.json();
}

// Hook for fetching accounts
export function useAccounts() {
  return useQuery({
    queryKey: accountsKeys.lists(),
    queryFn: fetchAccounts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for creating accounts
export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAccount,
    onSuccess: (newAccount) => {
      // Invalidate and refetch accounts list
      queryClient.invalidateQueries({ queryKey: accountsKeys.lists() });

      // Optionally, add the new account to the cache optimistically
      queryClient.setQueryData<FinancialAccount[]>(
        accountsKeys.lists(),
        (oldData) => {
          if (!oldData) return [newAccount];
          return [...oldData, newAccount];
        }
      );

      toast.success(`Account "${newAccount.name}" created successfully!`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create account'
      );
    },
  });
}

// Hook for account operations that need to refresh the list
export function useRefreshAccounts() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: accountsKeys.lists() });
  };
}

// Delete account
async function deleteAccountRequest(id: string): Promise<void> {
  const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete account');
  }
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccountRequest,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: accountsKeys.lists() });
      const previous = queryClient.getQueryData<FinancialAccount[]>(
        accountsKeys.lists()
      );
      queryClient.setQueryData<FinancialAccount[]>(
        accountsKeys.lists(),
        (old) => (old ? old.filter((a) => a.id !== id) : old)
      );
      return { previous };
    },
    onError: (error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(accountsKeys.lists(), context.previous);
      }
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete account'
      );
    },
    onSuccess: (_data, id) => {
      // Invalidate related detail/statistics queries
      queryClient.invalidateQueries({ queryKey: accountsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: accountsKeys.detail(id) });
      toast.success('Account deleted');
    },
  });
}

async function fetchSingleAccount(id: string): Promise<FinancialAccount> {
  const response = await fetch(`/api/accounts/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch account');
  }
  return response.json();
}

export function useAccount(
  id: string,
  initialData: FinancialAccount | null = null
) {
  return useQuery({
    queryKey: accountsKeys.detail(id),
    queryFn: () => fetchSingleAccount(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData,
  });
}

// Update account
async function updateAccount(
  data: UpdateAccountData
): Promise<FinancialAccount> {
  const { id, ...updateData } = data;
  const response = await fetch(`/api/accounts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update account');
  }

  return response.json();
}

// Hook for updating accounts
export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAccount,
    onMutate: async (data: UpdateAccountData) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: accountsKeys.detail(data.id!),
      });
      await queryClient.cancelQueries({ queryKey: accountsKeys.lists() });

      // Snapshot the previous values
      const previousAccount = queryClient.getQueryData<FinancialAccount>(
        accountsKeys.detail(data.id!)
      );
      const previousAccounts = queryClient.getQueryData<FinancialAccount[]>(
        accountsKeys.lists()
      );

      // Optimistically update the account detail
      if (previousAccount) {
        const updatedAccount = { ...previousAccount, ...data };
        queryClient.setQueryData(accountsKeys.detail(data.id!), updatedAccount);
      }

      // Optimistically update the accounts list
      if (previousAccounts) {
        const updatedAccounts = previousAccounts.map((account) =>
          account.id === data.id ? { ...account, ...data } : account
        );
        queryClient.setQueryData(accountsKeys.lists(), updatedAccounts);
      }

      return { previousAccount, previousAccounts };
    },
    onError: (error, data, context) => {
      // Rollback on error
      if (context?.previousAccount) {
        queryClient.setQueryData(
          accountsKeys.detail(data.id!),
          context.previousAccount
        );
      }
      if (context?.previousAccounts) {
        queryClient.setQueryData(
          accountsKeys.lists(),
          context.previousAccounts
        );
      }

      toast.error(
        error instanceof Error ? error.message : 'Failed to update account'
      );
    },
    onSuccess: (updatedAccount, data) => {
      // Update the cache with the server response
      queryClient.setQueryData(accountsKeys.detail(data.id!), updatedAccount);

      // Update the accounts list
      queryClient.setQueryData<FinancialAccount[]>(
        accountsKeys.lists(),
        (oldData) => {
          if (!oldData) return [updatedAccount];
          return oldData.map((account) =>
            account.id === updatedAccount.id ? updatedAccount : account
          );
        }
      );

      // Invalidate ALL dependent queries that rely on account data
      const accountId = data.id!;

      // 1. Invalidate account-specific queries
      queryClient.invalidateQueries({
        queryKey: accountsKeys.detail(accountId),
      });
      queryClient.invalidateQueries({ queryKey: accountsKeys.lists() });

      // 2. Invalidate account statistics (balance changes affect calculations)
      queryClient.invalidateQueries({
        queryKey: accountStatisticsKeys.detail(accountId),
      });
      queryClient.invalidateQueries({ queryKey: accountStatisticsKeys.all });

      // 3. Invalidate transaction queries for this account (balance may affect display)
      queryClient.invalidateQueries({
        queryKey: transactionsKeys.account(accountId),
      });

      // 4. Invalidate global/dashboard queries that aggregate account data
      // These queries don't have specific keys but are often server-side rendered
      // We invalidate based on common patterns used in dashboard components
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return (
            // Dashboard-related queries
            key.includes('dashboard') ||
            key.includes('total-balance') ||
            key.includes('accounts-summary') ||
            // Any query that might aggregate account data
            (Array.isArray(key) &&
              key.some(
                (k) =>
                  typeof k === 'string' &&
                  (k.includes('account') ||
                    k.includes('balance') ||
                    k.includes('statistics'))
              ))
          );
        },
      });

      toast.success(`Account "${updatedAccount.name}" updated successfully!`);
    },
  });
}

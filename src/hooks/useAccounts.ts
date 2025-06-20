import { FinancialAccount } from '@/generated/prisma';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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

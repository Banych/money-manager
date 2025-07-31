'use client';

import AccountCard from '@/components/accounts/account-card';
import AccountSkeleton from '@/components/accounts/account-skeleton';
import { useAccounts } from '@/hooks/useAccounts';
import { Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Props = {
  AddAccountComponent?: React.ReactNode;
};

export default function AccountsList({ AddAccountComponent }: Props) {
  const { data: accounts = [], isLoading, error } = useAccounts();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <AccountSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-red-500">
          <p>Failed to load accounts</p>
          <p className="text-sm text-gray-500">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="py-12 text-center">
        <Wallet className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          No accounts yet
        </h3>
        <p className="mb-4 text-gray-500">
          Get started by creating your first financial account.
        </p>
        {AddAccountComponent}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onClick={() => {
            router.push(`/accounts/${account.id}`);
          }}
        />
      ))}
      {AddAccountComponent}
    </div>
  );
}

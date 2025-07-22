'use client';

import AccountSkeleton from '@/components/accounts/account-skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  accountTypeIcons,
  accountTypeLabels,
  formatBalance,
} from '@/constants/accounts';
import { useAccounts } from '@/hooks/useAccounts';
import { Wallet } from 'lucide-react';

type Props = {
  AddAccountComponent?: React.ReactNode;
};

export default function AccountsList({ AddAccountComponent }: Props) {
  const { data: accounts = [], isLoading, error } = useAccounts();

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
      {accounts.map((account) => {
        const Icon = accountTypeIcons[account.type];
        const isNegative = account.balance < 0;

        return (
          <Card
            key={account.id}
            className="transition-shadow hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="truncate pr-2 text-sm font-medium">
                {account.name}
              </CardTitle>
              <Icon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className={`text-2xl font-bold ${
                      isNegative ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {formatBalance(account.balance, account.currency)}
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs"
                  >
                    {accountTypeLabels[account.type]}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      {AddAccountComponent}
    </div>
  );
}

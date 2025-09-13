'use client';

import TransactionListItem from '@/components/transactions/transaction-list-item';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EmptyState from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { FinancialAccount } from '@/generated/prisma';
import { useAccountTransactions } from '@/hooks/useTransactions';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface RecentTransactionsProps {
  account: FinancialAccount;
  limit?: number;
}

export default function RecentTransactions({
  account,
  limit = 10,
}: RecentTransactionsProps) {
  const { data, isLoading, isError } = useAccountTransactions(account.id, {
    limit,
  });

  const transactions = data?.data ?? [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5" />
            <span>Recent Transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5" />
            <span>Recent Transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">Failed to load transactions.</p>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5" />
            <span>Recent Transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<ShoppingBag className="h-12 w-12" />}
            title="No transactions yet"
            description="Transactions will appear here once you start using this account."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5" />
            <span>Recent Transactions</span>
          </div>
          <Badge
            variant="secondary"
            className="text-xs"
          >
            {transactions.length} transactions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-none space-y-3">
          {transactions.map((transaction) => (
            <TransactionListItem
              key={transaction.id}
              transaction={transaction}
              showAccount={false}
              account={{
                name: account.name,
                currency: account.currency,
              }}
            />
          ))}
        </ul>

        {transactions.length >= limit && (
          <div className="mt-4 text-center">
            <Button
              asChild
              variant="link"
            >
              <Link href="/transactions">View all transactions</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

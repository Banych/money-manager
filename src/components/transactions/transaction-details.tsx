'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Transaction } from '@/generated/prisma';
import { useTransaction } from '@/hooks/useTransactions';
import { formatDateTime } from '@/lib/date';
import { notFound } from 'next/navigation';
import { FC } from 'react';

type TransactionDetailsProps = {
  initialTransaction: Transaction & {
    account: {
      id: string;
      name: string;
      currency: string;
    };
  };
};

const TransactionDetails: FC<TransactionDetailsProps> = ({
  initialTransaction,
}) => {
  const { data: transaction, isPending: isTransactionPending } = useTransaction(
    initialTransaction.id,
    undefined,
    { initialData: initialTransaction }
  );

  if (!transaction) {
    return notFound();
  }

  if (isTransactionPending) {
    return (
      <>
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <div>
        <h1 className="mb-1 text-2xl font-semibold">Transaction Detail</h1>
        <p className="text-muted-foreground text-sm">
          Created {formatDateTime(transaction.createdAt)}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-muted-foreground mb-1 text-xs uppercase">
            Amount
          </div>
          <div
            className={
              transaction.type === 'INCOME'
                ? 'font-semibold text-green-600'
                : 'font-semibold text-red-600'
            }
          >
            {transaction.type === 'INCOME' ? '+' : '-'}
            {transaction.amount.toFixed(2)} {transaction.account.currency}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-muted-foreground mb-1 text-xs uppercase">
            Type
          </div>
          <div className="font-semibold">{transaction.type}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-muted-foreground mb-1 text-xs uppercase">
            Category
          </div>
          <div className="font-semibold">{transaction.category || '—'}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-muted-foreground mb-1 text-xs uppercase">
            Date
          </div>
          <div className="font-semibold">
            {formatDateTime(transaction.date)}
          </div>
        </div>
        <div className="rounded-lg border p-4 md:col-span-2 lg:col-span-3">
          <div className="text-muted-foreground mb-1 text-xs uppercase">
            Description
          </div>
          <div className="font-semibold">{transaction.description || '—'}</div>
        </div>
      </div>
    </>
  );
};

export default TransactionDetails;

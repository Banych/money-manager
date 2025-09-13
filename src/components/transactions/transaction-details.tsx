'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Transaction } from '@/generated/prisma';
import { useTransaction } from '@/hooks/useTransactions';
import { formatDateTime } from '@/lib/date';
import { Calendar, CreditCard, DollarSign, FileText, Tag } from 'lucide-react';
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
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
            <div className="mt-6">
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Transaction Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Transaction Details
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Created {formatDateTime(transaction.createdAt)}
          </p>
        </CardHeader>
      </Card>

      {/* Transaction Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Amount */}
            <div className="flex items-start gap-3">
              <div className="bg-muted rounded-lg p-2">
                <DollarSign className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                  Amount
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-lg font-semibold ${
                      transaction.type === 'INCOME'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    {transaction.amount.toFixed(2)}{' '}
                    {transaction.account.currency}
                  </span>
                  <Badge
                    variant={
                      transaction.type === 'INCOME' ? 'default' : 'destructive'
                    }
                    className="text-xs"
                  >
                    {transaction.type === 'INCOME' ? 'Income' : 'Expense'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="flex items-start gap-3">
              <div className="bg-muted rounded-lg p-2">
                <Tag className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                  Category
                </div>
                <div className="font-medium">
                  {transaction.category ? (
                    <Badge variant="outline">{transaction.category}</Badge>
                  ) : (
                    <span className="text-muted-foreground">No category</span>
                  )}
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-3">
              <div className="bg-muted rounded-lg p-2">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                  Transaction Date
                </div>
                <div className="font-medium">
                  {formatDateTime(transaction.date)}
                </div>
              </div>
            </div>

            {/* Account */}
            <div className="flex items-start gap-3">
              <div className="bg-muted rounded-lg p-2">
                <CreditCard className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                  Account
                </div>
                <div className="font-medium">{transaction.account.name}</div>
              </div>
            </div>
          </div>

          {/* Description - Full Width */}
          {transaction.description && (
            <div className="mt-6 flex items-start gap-3">
              <div className="bg-muted rounded-lg p-2">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                  Description
                </div>
                <div className="font-medium">{transaction.description}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionDetails;

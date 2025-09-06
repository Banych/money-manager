'use client';

import { Badge } from '@/components/ui/badge';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Transaction } from '@/generated/prisma';
import { useAllTransactions } from '@/hooks/useTransactions';
import { Receipt } from 'lucide-react';
import { FC } from 'react';

type ExpensesIncomeWidgetHeaderProps = {
  initialTransactions: (Transaction & {
    account: { id: string; name: string; currency: string; type: string };
  })[];
  userId: string;
  firstDayOfMonth: Date;
  lastDayOfMonth: Date;
};

const ExpensesIncomeWidgetHeaderContent: FC<
  ExpensesIncomeWidgetHeaderProps
> = ({ initialTransactions, userId, firstDayOfMonth, lastDayOfMonth }) => {
  const { data: allTransactions, isPending: isPendingAllTransactions } =
    useAllTransactions(
      {
        from: firstDayOfMonth,
        to: lastDayOfMonth,
        userId,
      },
      {
        initialData: {
          data: initialTransactions,
          total: initialTransactions.length,
          page: 1,
          limit: initialTransactions.length,
          pages: 1,
        },
      }
    );

  const hasTransactions = !!allTransactions?.data.length;

  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Receipt className="h-5 w-5 text-green-600" />
        Expenses & Income
        {isPendingAllTransactions ? (
          <Skeleton className="h-5.5 w-17" />
        ) : (
          <>
            {!hasTransactions && (
              <Badge
                variant="secondary"
                className="ml-auto"
              >
                No Data
              </Badge>
            )}
            {hasTransactions && (
              <Badge
                variant="secondary"
                className="ml-auto"
              >
                {allTransactions.data.length} Transactions
              </Badge>
            )}
          </>
        )}
      </CardTitle>
      <CardDescription>
        {hasTransactions
          ? "This month's financial activity"
          : 'Add transactions to see your financial activity'}
      </CardDescription>
    </CardHeader>
  );
};

export default ExpensesIncomeWidgetHeaderContent;

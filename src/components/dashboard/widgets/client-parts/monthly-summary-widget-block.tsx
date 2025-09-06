'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { formatBalance } from '@/constants/accounts';
import { Transaction } from '@/generated/prisma';
import { useAllTransactions } from '@/hooks/useTransactions';
import {
  calculateSimpleMonthlyBudget,
  SimpleMonthlyBudget,
} from '@/lib/transactions/balance';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { FC } from 'react';

type MonthlySummaryWidgetBlockProps = {
  initialData: SimpleMonthlyBudget;
  userId: string;
  firstDayOfMonth: Date;
  lastDayOfMonth: Date;
  initialTransactions: (Transaction & {
    account: { id: string; name: string; currency: string; type: string };
  })[];
};

const MonthlySummaryWidgetBlock: FC<MonthlySummaryWidgetBlockProps> = ({
  initialData,
  firstDayOfMonth,
  lastDayOfMonth,
  userId,
  initialTransactions,
}) => {
  const { data: allTransactions, isPending: isPendingAllTransactions } =
    useAllTransactions(
      {
        userId,
        from: firstDayOfMonth,
        to: lastDayOfMonth,
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

  const { monthlyIncome, monthlyExpenses, primaryCurrency } = allTransactions
    ? calculateSimpleMonthlyBudget(allTransactions.data)
    : initialData;

  const netIncome = monthlyIncome - monthlyExpenses;

  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      <div className="rounded-lg bg-green-50 p-3">
        <div className="mb-1 flex items-center justify-center gap-1">
          <ArrowUpIcon className="h-4 w-4 text-green-600" />
          <p className="text-xs font-medium text-green-700">Income</p>
        </div>
        {isPendingAllTransactions ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <p className="text-lg font-bold text-green-600">
            +{formatBalance(monthlyIncome, primaryCurrency, false)}
          </p>
        )}
      </div>

      <div className="rounded-lg bg-red-50 p-3">
        <div className="mb-1 flex items-center justify-center gap-1">
          <ArrowDownIcon className="h-4 w-4 text-red-600" />
          <p className="text-xs font-medium text-red-700">Expenses</p>
        </div>
        {isPendingAllTransactions ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <p className="text-lg font-bold text-red-600">
            -{formatBalance(monthlyExpenses, primaryCurrency, false)}
          </p>
        )}
      </div>

      <div
        className={`rounded-lg p-3 ${netIncome >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}
      >
        {isPendingAllTransactions ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <>
            <div className="mb-1 flex items-center justify-center gap-1">
              {netIncome >= 0 ? (
                <TrendingUp className="h-4 w-4 text-blue-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-orange-600" />
              )}
              <p
                className={`text-xs font-medium ${netIncome >= 0 ? 'text-blue-700' : 'text-orange-700'}`}
              >
                Net
              </p>
            </div>
            <p
              className={`text-lg font-bold ${netIncome >= 0 ? 'text-blue-600' : 'text-orange-600'}`}
            >
              {netIncome >= 0 ? '+' : ''}
              {formatBalance(Math.abs(netIncome), primaryCurrency, false)}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default MonthlySummaryWidgetBlock;

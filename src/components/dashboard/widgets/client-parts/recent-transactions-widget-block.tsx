'use client';

import TransactionActionMenu from '@/components/transactions/transaction-action-menu';
import Loader from '@/components/ui/loader';
import { formatBalance } from '@/constants/accounts';
import { Transaction, TransactionType } from '@/generated/prisma';
import { useAllTransactions } from '@/hooks/useTransactions';
import { formatDateTime } from '@/lib/date';
import { FC } from 'react';

type RecentTransactionsWidgetBlockProps = {
  initialTransactions: (Transaction & {
    account: {
      id: string;
      name: string;
      currency: string;
      type: string;
    };
  })[];
  userId: string;
  firstDayOfMonth: Date;
  lastDayOfMonth: Date;
};

const RecentTransactionsWidgetBlock: FC<RecentTransactionsWidgetBlockProps> = ({
  initialTransactions,
  userId,
  firstDayOfMonth,
  lastDayOfMonth,
}) => {
  const { data: transactions, isPending: isTransactionsPending } =
    useAllTransactions(
      {
        limit: 3,
        userId,
        from: firstDayOfMonth,
        to: lastDayOfMonth,
      },
      {
        initialData: {
          data: initialTransactions,
          total: 3,
          page: 1,
          limit: 3,
          pages: 1,
        },
      }
    );
  return (
    !!transactions?.data.length && (
      <div>
        <h4 className="mb-2 text-sm font-medium text-gray-700">
          Last 3 Transactions
        </h4>
        <div className="max-h-30 space-y-2 overflow-y-auto">
          {isTransactionsPending ? (
            <Loader label="Loading transactions..." />
          ) : (
            transactions.data.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded bg-gray-50 p-2 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate font-medium"
                    title={transaction.description || 'No description'}
                  >
                    {transaction.description || 'No description'}
                  </p>
                  <p
                    className="truncate text-xs text-gray-500"
                    title={transaction.account.name}
                  >
                    {transaction.account.name}
                  </p>
                </div>
                <div className="ml-2 flex items-center space-x-2">
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.type === TransactionType.INCOME
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.type === TransactionType.INCOME ? '+' : '-'}
                      {formatBalance(
                        transaction.amount,
                        transaction.account.currency
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(transaction.date)}
                    </p>
                  </div>
                  <TransactionActionMenu transaction={transaction} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  );
};

export default RecentTransactionsWidgetBlock;

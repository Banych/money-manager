'use client';

import { formatCurrency } from '@/components/accounts/account-details-data';
import { Badge } from '@/components/ui/badge';
import { TransactionType } from '@/generated/prisma';
import { formatDateTime } from '@/lib/date';
import { cn } from '@/lib/utils';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { forwardRef } from 'react';
import TransactionActionMenu from './transaction-action-menu';

interface TransactionWithAccount {
  id: string;
  description: string | null;
  amount: number;
  type: TransactionType;
  category: string | null;
  date: Date;
  account?: {
    id: string;
    name: string;
    currency: string;
    type: string;
  };
  // For account transactions where account details come from context
  accountId?: string;
}

interface TransactionListItemProps {
  transaction: TransactionWithAccount;
  showAccount?: boolean;
  account?: {
    name: string;
    currency: string;
  };
  className?: string;
}

const TransactionListItem = forwardRef<HTMLLIElement, TransactionListItemProps>(
  ({ transaction, showAccount = true, account, className }, ref) => {
    // Use the transaction's account if available, otherwise use the passed account
    const displayAccount = transaction.account || account;

    const getTransactionIcon = (type: TransactionType) =>
      type === TransactionType.INCOME ? (
        <ArrowUpIcon className="h-4 w-4 text-green-600" />
      ) : (
        <ArrowDownIcon className="h-4 w-4 text-red-600" />
      );

    const getCategoryColor = (categoryName?: string) => {
      if (!categoryName) return 'bg-gray-100 text-gray-800';

      const colorMap: Record<string, string> = {
        'Food & Dining': 'bg-orange-100 text-orange-800',
        'Food & Groceries': 'bg-orange-100 text-orange-800',
        Transportation: 'bg-blue-100 text-blue-800',
        Shopping: 'bg-purple-100 text-purple-800',
        Entertainment: 'bg-pink-100 text-pink-800',
        'Bills & Utilities': 'bg-yellow-100 text-yellow-800',
        Income: 'bg-green-100 text-green-800',
        Salary: 'bg-green-100 text-green-800',
        Freelance: 'bg-green-100 text-green-800',
        Healthcare: 'bg-red-100 text-red-800',
        Travel: 'bg-indigo-100 text-indigo-800',
        Education: 'bg-cyan-100 text-cyan-800',
        'Personal Care': 'bg-emerald-100 text-emerald-800',
      };

      return colorMap[categoryName] || 'bg-gray-100 text-gray-800';
    };

    if (!displayAccount) {
      return null;
    }

    return (
      <li
        ref={ref}
        className={cn(
          'hover:bg-muted/50 rounded-lg border p-3 transition-colors sm:p-4',
          className
        )}
      >
        {/* Mobile Layout */}
        <div className="flex sm:hidden">
          <div className="flex flex-1 items-start space-x-3">
            <div className="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
              {getTransactionIcon(transaction.type)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-start justify-between">
                <p className="truncate pr-2 text-sm font-medium">
                  {transaction.description || '—'}
                </p>
                <p
                  className={cn(
                    'flex-shrink-0 text-sm font-bold',
                    transaction.type === TransactionType.INCOME
                      ? 'text-green-600'
                      : 'text-red-600'
                  )}
                >
                  {transaction.type === TransactionType.INCOME ? '+' : '-'}
                  {formatCurrency(transaction.amount, displayAccount.currency)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  {showAccount && (
                    <span className="truncate">{displayAccount.name}</span>
                  )}
                  {showAccount && <span>•</span>}
                  <span>{formatDateTime(transaction.date)}</span>
                </div>
                <TransactionActionMenu transaction={transaction} />
              </div>
              {transaction.category && (
                <div className="mt-1">
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs',
                      getCategoryColor(transaction.category)
                    )}
                  >
                    {transaction.category}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden items-center justify-between sm:flex">
          <div className="flex min-w-0 flex-1 items-center space-x-4">
            <div className="bg-muted flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full">
              {getTransactionIcon(transaction.type)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <p className="truncate font-medium">
                  {transaction.description || '—'}
                </p>
                {transaction.category && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'flex-shrink-0 text-xs',
                      getCategoryColor(transaction.category)
                    )}
                  >
                    {transaction.category}
                  </Badge>
                )}
              </div>
              <div className="text-muted-foreground flex items-center gap-4 text-sm">
                {showAccount && (
                  <span className="truncate">{displayAccount.name}</span>
                )}
                <span className="flex-shrink-0">
                  {formatDateTime(transaction.date)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center space-x-3">
            <div className="text-right">
              <p
                className={cn(
                  'text-lg font-bold',
                  transaction.type === TransactionType.INCOME
                    ? 'text-green-600'
                    : 'text-red-600'
                )}
              >
                {transaction.type === TransactionType.INCOME ? '+' : '-'}
                {formatCurrency(transaction.amount, displayAccount.currency)}
              </p>
              <p className="text-muted-foreground text-xs">
                {transaction.type === TransactionType.INCOME
                  ? 'Credit'
                  : 'Debit'}
              </p>
            </div>
            <TransactionActionMenu transaction={transaction} />
          </div>
        </div>
      </li>
    );
  }
);

TransactionListItem.displayName = 'TransactionListItem';

export default TransactionListItem;

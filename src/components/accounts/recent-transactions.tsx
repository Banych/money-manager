'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialAccount } from '@/generated/prisma';
import { cn } from '@/lib/utils';
import { ArrowDownIcon, ArrowUpIcon, ShoppingBag } from 'lucide-react';
import {
  formatCurrency,
  formatTransactionDate,
  generateMockTransactions,
  MockTransaction,
} from './account-details-data';

interface RecentTransactionsProps {
  account: FinancialAccount;
  limit?: number;
}

export default function RecentTransactions({
  account,
  limit = 10,
}: RecentTransactionsProps) {
  const transactions = generateMockTransactions(account.id, 30).slice(0, limit);

  const getTransactionIcon = (transaction: MockTransaction) => {
    return transaction.type === 'income' ? (
      <ArrowUpIcon className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 text-red-600" />
    );
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-gray-100 text-gray-800';

    const colorMap: Record<string, string> = {
      'Food & Dining': 'bg-orange-100 text-orange-800',
      Transportation: 'bg-blue-100 text-blue-800',
      Shopping: 'bg-purple-100 text-purple-800',
      Entertainment: 'bg-pink-100 text-pink-800',
      'Bills & Utilities': 'bg-yellow-100 text-yellow-800',
      Income: 'bg-green-100 text-green-800',
      Healthcare: 'bg-red-100 text-red-800',
      Travel: 'bg-indigo-100 text-indigo-800',
      Education: 'bg-cyan-100 text-cyan-800',
      'Personal Care': 'bg-emerald-100 text-emerald-800',
    };

    return colorMap[category] || 'bg-gray-100 text-gray-800';
  };

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
          <div className="py-8 text-center">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No transactions yet
            </h3>
            <p className="text-gray-500">
              Transactions will appear here once you start using this account.
            </p>
          </div>
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
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                  {getTransactionIcon(transaction)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {transaction.description}
                  </p>
                  <div className="mt-1 flex items-center space-x-2">
                    <p className="text-muted-foreground text-sm">
                      {formatTransactionDate(transaction.date)}
                    </p>
                    {transaction.category && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-xs',
                          getCategoryColor(transaction.category)
                        )}
                      >
                        {transaction.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    'font-bold',
                    transaction.type === 'income'
                      ? 'text-green-600'
                      : 'text-red-600'
                  )}
                >
                  {formatCurrency(transaction.amount, account.currency)}
                </p>
                <p className="text-muted-foreground text-xs">
                  {transaction.type === 'income' ? 'Credit' : 'Debit'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {transactions.length >= limit && (
          <div className="mt-4 text-center">
            <button className="text-primary text-sm hover:underline">
              View all transactions
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

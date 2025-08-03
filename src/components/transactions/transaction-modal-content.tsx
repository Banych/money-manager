'use client';

import { TransactionType } from '@/generated/prisma';
import { useSearchParams } from 'next/navigation';

export function useTransactionModalContent() {
  const searchParams = useSearchParams();
  const type = searchParams?.get('type') as TransactionType | null;

  const getTitle = () => {
    if (type === TransactionType.INCOME) return 'Add Income';
    if (type === TransactionType.EXPENSE) return 'Add Expense';
    return 'Add Transaction';
  };

  const getDescription = () => {
    if (type === TransactionType.INCOME) {
      return 'Record income to your account.';
    }
    if (type === TransactionType.EXPENSE) {
      return 'Record an expense from your account.';
    }
    return 'Add a new income or expense transaction.';
  };

  return {
    title: getTitle(),
    description: getDescription(),
  };
}

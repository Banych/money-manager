import { TransactionType } from '@/generated/prisma';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTransactionPageTitle(type?: TransactionType) {
  switch (type) {
    case TransactionType.INCOME:
      return 'Add Income';
    case TransactionType.EXPENSE:
      return 'Add Expense';
    default:
      return 'Add Transaction';
  }
}

export function getTransactionPageDescription(type?: TransactionType) {
  switch (type) {
    case TransactionType.INCOME:
      return 'Record a new income transaction';
    case TransactionType.EXPENSE:
      return 'Record a new expense transaction';
    default:
      return 'Record a new transaction';
  }
}

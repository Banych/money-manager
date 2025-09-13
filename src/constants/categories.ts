import { TransactionType } from '@/generated/prisma';

export const DEFAULT_CATEGORIES: Record<TransactionType, string[]> = {
  INCOME: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  EXPENSE: [
    'Food & Groceries',
    'Transportation',
    'Entertainment',
    'Bills & Utilities',
    'Shopping',
    'Healthcare',
    'Education',
    'Other',
  ],
};

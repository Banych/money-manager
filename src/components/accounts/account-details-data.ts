import { FinancialAccount } from '@/generated/prisma';

export interface MockTransaction {
  id: string;
  description: string;
  amount: number;
  date: Date;
  type: 'income' | 'expense';
  category?: string;
}

export interface AccountStatistics {
  monthlyIncome: number;
  monthlyExpenses: number;
  netChange: number;
  transactionCount: number;
  averageTransaction: number;
  balanceHistory: Array<{ date: Date; balance: number }>;
}

/**
 * Generate mock transaction history for an account
 */
export function generateMockTransactions(
  accountId: string,
  count: number = 15
): MockTransaction[] {
  const seed = accountId
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const descriptions = [
    'Grocery Store',
    'Coffee Shop',
    'Gas Station',
    'Restaurant',
    'Online Shopping',
    'Salary',
    'Freelance Work',
    'ATM Withdrawal',
    'Utility Bill',
    'Rent Payment',
    'Insurance Payment',
    'Medical Expense',
    'Entertainment',
    'Transportation',
    'Subscription Service',
    'Bank Transfer',
    'Investment',
    'Refund',
  ];

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Income',
    'Healthcare',
    'Travel',
    'Education',
    'Personal Care',
  ];

  const transactions: MockTransaction[] = [];

  for (let i = 0; i < count; i++) {
    const transactionSeed = seed + i;

    // Generate date (last 30 days)
    const date = new Date();
    date.setDate(date.getDate() - (transactionSeed % 30));

    // Generate amount (€5 to €500 for expenses, €500 to €3000 for income)
    const isIncome = transactionSeed % 5 === 0; // 20% chance of income
    const baseAmount = isIncome
      ? 500 + (transactionSeed % 2500)
      : 5 + (transactionSeed % 495);
    const amount = isIncome ? baseAmount : -baseAmount;

    // Select description and category
    const description = descriptions[transactionSeed % descriptions.length];
    const category = categories[transactionSeed % categories.length];

    transactions.push({
      id: `tx_${accountId}_${i}`,
      description: `${description}${isIncome ? ' - Payment' : ''}`,
      amount,
      date,
      type: isIncome ? 'income' : 'expense',
      category,
    });
  }

  // Sort by date descending (newest first)
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Generate account statistics from transactions
 */
export function generateAccountStatistics(
  account: FinancialAccount,
  transactions: MockTransaction[]
): AccountStatistics {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  // Filter transactions for current month
  const monthlyTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === thisMonth && txDate.getFullYear() === thisYear;
  });

  const monthlyIncome = monthlyTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const monthlyExpenses = Math.abs(
    monthlyTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0)
  );

  const netChange = monthlyIncome - monthlyExpenses;
  const transactionCount = monthlyTransactions.length;
  const averageTransaction =
    transactionCount > 0
      ? Math.abs(
          monthlyTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
        ) / transactionCount
      : 0;

  // Generate balance history (last 7 days)
  const balanceHistory: Array<{ date: Date; balance: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Simulate balance changes
    const dayVariation =
      ((account.id.charCodeAt(i % account.id.length) + i) % 200) - 100;
    const balance = account.balance + dayVariation;

    balanceHistory.push({ date, balance });
  }

  return {
    monthlyIncome,
    monthlyExpenses,
    netChange,
    transactionCount,
    averageTransaction,
    balanceHistory,
  };
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatted = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format date for display
 */
import { dayjs, formatRelative } from '@/lib/date';
export function formatTransactionDate(input: Date | string): string {
  const d = dayjs(input);
  if (!d.isValid()) return '';
  return formatRelative(input);
}

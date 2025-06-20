import { FinancialAccountType } from '@/generated/prisma';
import { Building2, CreditCard, Gift, TrendingUp, Wallet } from 'lucide-react';

/**
 * Account type display labels for UI
 */
export const accountTypeLabels = {
  [FinancialAccountType.CASH]: 'Cash/Wallet',
  [FinancialAccountType.BANK_ACCOUNT]: 'Bank Account',
  [FinancialAccountType.CREDIT_CARD]: 'Credit Card',
  [FinancialAccountType.INVESTMENT]: 'Investment Account',
  [FinancialAccountType.PREPAID]: 'Prepaid Card',
} as const;

/**
 * Account type icons for UI
 */
export const accountTypeIcons = {
  [FinancialAccountType.CASH]: Wallet,
  [FinancialAccountType.BANK_ACCOUNT]: Building2,
  [FinancialAccountType.CREDIT_CARD]: CreditCard,
  [FinancialAccountType.INVESTMENT]: TrendingUp,
  [FinancialAccountType.PREPAID]: Gift,
} as const;

/**
 * Currency symbols for display
 */
export const currencySymbols = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  JPY: '¥',
} as const;

/**
 * Supported currencies list
 */
export const supportedCurrencies = [
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
] as const;

/**
 * Format balance with currency symbol
 */
export const formatBalance = (balance: number, currency: string): string => {
  const symbol =
    currencySymbols[currency as keyof typeof currencySymbols] || currency;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(balance));

  return balance < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
};

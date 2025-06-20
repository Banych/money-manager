import { FinancialAccountType } from '@/generated/prisma';
import { z } from 'zod';

const zFinancialAccountType = z.nativeEnum(FinancialAccountType);

export const createAccountValidator = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    balance: z.number(), // Allow negative balances for credit cards, lines of credit, etc.
    currency: z.string().min(1, 'Currency is required'),
    type: zFinancialAccountType,
  })
  .refine(
    (data) => {
      // Validate balance constraints based on account type
      if (
        data.type === FinancialAccountType.CASH ||
        data.type === FinancialAccountType.PREPAID
      ) {
        return data.balance >= 0;
      }
      return true; // Other account types can have negative balances
    },
    {
      message: 'Cash and prepaid accounts cannot have negative balances',
      path: ['balance'],
    }
  );

export const updateAccountValidator = z
  .object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters long')
      .optional(),
    balance: z.number().optional(),
    currency: z.string().optional(),
    type: zFinancialAccountType.optional().default(FinancialAccountType.CASH),
  })
  .refine(
    (data) => {
      // Only validate if both balance and type are provided
      if (data.balance !== undefined && data.type !== undefined) {
        if (
          data.type === FinancialAccountType.CASH ||
          data.type === FinancialAccountType.PREPAID
        ) {
          return data.balance >= 0;
        }
      }
      return true;
    },
    {
      message: 'Cash and prepaid accounts cannot have negative balances',
      path: ['balance'],
    }
  );

export type CreateAccountData = z.infer<typeof createAccountValidator>;
export type UpdateAccountData = z.infer<typeof updateAccountValidator>;

import { TransactionType } from '@/generated/prisma';
import { isBefore } from 'date-fns';
import { z } from 'zod';

const zTransactionType = z.enum(TransactionType);

export const createTransactionValidator = z.object({
  amount: z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? 'Amount is required'
          : 'Amount must be a number',
    })
    .positive('Amount must be greater than zero')
    .max(1000000, 'Amount cannot exceed 1,000,000'),
  description: z
    .string()
    .min(1, 'Description must be at least 1 character')
    .or(z.literal('').transform(() => undefined))
    .optional(),
  type: zTransactionType,
  category: z
    .string()
    .min(1, 'Category must be at least 1 character')
    .or(z.literal('').transform(() => undefined))
    .optional(),
  date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Date must be a valid date string',
    })
    .refine(
      (date) => {
        return isBefore(date, new Date());
      },
      { message: 'Date cannot be in the future' }
    ),
  accountId: z.string().min(1, 'Account ID is required'),
});

export type CreateTransactionData = z.infer<typeof createTransactionValidator>;

export const editTransactionValidator = z.object({
  id: z.cuid('Invalid transaction ID format'),
  amount: z
    .number({ error: 'Amount must be a number' })
    .positive('Amount must be greater than zero')
    .max(1000000, 'Amount cannot exceed 1,000,000')
    .optional(),
  description: z
    .string()
    .transform((val) => (val === '' ? undefined : val))
    .optional(),
  type: zTransactionType.optional(),
  category: z
    .string()
    .transform((val) => (val === '' ? undefined : val))
    .optional(),
  date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Date must be a valid date string',
    })
    .optional(),
});

export type EditTransactionData = z.infer<typeof editTransactionValidator>;

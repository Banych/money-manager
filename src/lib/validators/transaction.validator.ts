import { TransactionType } from '@/generated/prisma';
import { isBefore } from 'date-fns';
import { z } from 'zod';

const zTransactionType = z.nativeEnum(TransactionType);

export const createTransactionValidator = z.object({
  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .positive('Amount must be greater than zero')
    .max(1000000, 'Amount cannot exceed 1,000,000'),
  description: z
    .string()
    .min(1, 'Description must be at least 1 character')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  type: zTransactionType,
  category: z
    .string()
    .min(1, 'Category must be at least 1 character')
    .optional()
    .or(z.literal('').transform(() => undefined)),
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

export const updateTransactionValidator = z.object({
  id: z.string().cuid('Invalid transaction ID format'),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than zero')
    .max(1000000, 'Amount cannot exceed 1,000,000')
    .optional(),
  description: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  type: zTransactionType.optional(),
  category: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Date must be a valid date string',
    })
    .optional(),
});

export type UpdateTransactionData = z.infer<typeof updateTransactionValidator>;

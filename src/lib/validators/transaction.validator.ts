import { TransactionType } from '@/generated/prisma';
import { z } from 'zod';

const zTransactionType = z.nativeEnum(TransactionType);

export const createTransactionValidator = z.object({
  amount: z.number().positive('Amount must be greater than zero'),
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
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Date must be a valid date string',
  }),
  accountId: z.string().min(1, 'Account ID is required'),
});

export type CreateTransactionData = z.infer<typeof createTransactionValidator>;

export const updateTransactionValidator = z.object({
  id: z.string().cuid('Invalid transaction ID format'),
  amount: z.number().positive('Amount must be greater than zero').optional(),
  description: z.string().optional(),
  type: zTransactionType.optional(),
  category: z.string().optional(),
  date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Date must be a valid date string',
    })
    .optional(),
});

export type UpdateTransactionData = z.infer<typeof updateTransactionValidator>;

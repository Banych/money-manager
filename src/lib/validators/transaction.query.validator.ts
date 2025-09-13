import { TransactionType } from '@/generated/prisma';
import { z } from 'zod';

export const transactionQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined))
    .refine((v) => v === undefined || v > 0, 'page must be > 0'),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined))
    .refine(
      (v) => v === undefined || (v > 0 && v <= 100),
      'limit must be 1-100'
    ),
  type: z.nativeEnum(TransactionType).optional(),
  category: z.string().min(1).optional(),
  search: z.string().min(1).optional(),
  from: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(Date.parse(v)), 'from must be valid date')
    .transform((v) => (v ? new Date(v) : undefined)),
  to: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(Date.parse(v)), 'to must be valid date')
    .transform((v) => (v ? new Date(v) : undefined)),
});

export type TransactionQueryParams = z.infer<typeof transactionQuerySchema>;

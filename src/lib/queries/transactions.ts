import { Prisma, Transaction, TransactionType } from '@/generated/prisma';
import { db } from '@/lib/db';

export interface TransactionListParams {
  accountId?: string;
  userId: string;
  page?: number;
  limit?: number;
  type?: TransactionType;
  category?: string;
  from?: Date;
  to?: Date;
  search?: string;
}

export interface TransactionListResult {
  data: (Transaction & {
    account: {
      id: string;
      name: string;
      currency: string;
      type: string;
    };
  })[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export async function getAccountTransactions(
  params: TransactionListParams
): Promise<TransactionListResult> {
  const { accountId, userId } = params;

  if (!accountId) {
    throw new Error('accountId is required for getAccountTransactions');
  }

  const page = params.page && params.page > 0 ? params.page : 1;
  const limit =
    params.limit && params.limit > 0 ? Math.min(params.limit, 100) : 20;
  const skip = (page - 1) * limit;

  const where: Prisma.TransactionWhereInput = {
    accountId,
    userId,
    ...(params.type ? { type: params.type } : {}),
    ...(params.category ? { category: params.category } : {}),
    ...(params.search
      ? {
          description: {
            contains: params.search,
            mode: 'insensitive',
          },
        }
      : {}),
    ...(params.from || params.to
      ? {
          date: {
            ...(params.from ? { gte: params.from } : {}),
            ...(params.to ? { lte: params.to } : {}),
          },
        }
      : {}),
  } as const;

  const [data, total] = await Promise.all([
    db.transaction.findMany({
      where,
      include: {
        account: {
          select: {
            id: true,
            name: true,
            currency: true,
            type: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    db.transaction.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
  };
}

export async function getAllTransactions(
  params: Omit<TransactionListParams, 'accountId'>
): Promise<TransactionListResult> {
  const { userId } = params;
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit =
    params.limit && params.limit > 0 ? Math.min(params.limit, 100) : 20;
  const skip = (page - 1) * limit;

  const where: Prisma.TransactionWhereInput = {
    userId,
    ...(params.type ? { type: params.type } : {}),
    ...(params.category ? { category: params.category } : {}),
    ...(params.search
      ? {
          description: {
            contains: params.search,
            mode: 'insensitive',
          },
        }
      : {}),
    ...(params.from || params.to
      ? {
          date: {
            ...(params.from ? { gte: params.from } : {}),
            ...(params.to ? { lte: params.to } : {}),
          },
        }
      : {}),
  } as const;

  const [data, total] = await Promise.all([
    db.transaction.findMany({
      where,
      include: {
        account: {
          select: {
            id: true,
            name: true,
            currency: true,
            type: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    db.transaction.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
  };
}

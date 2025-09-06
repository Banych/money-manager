import { Prisma } from '@/generated/prisma';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { recomputeAccountBalance } from '@/lib/transactions/balance';
import { transactionQuerySchema } from '@/lib/validators/transaction.query.validator';
import { createTransactionValidator } from '@/lib/validators/transaction.validator';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const parsed = transactionQuerySchema.safeParse(
      Object.fromEntries(url.searchParams.entries())
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query params', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { page, limit, type, category, from, to } = parsed.data;
    const currentPage = page && page > 0 ? page : 1;
    const currentLimit = limit && limit > 0 ? Math.min(limit, 100) : 20;
    const skip = (currentPage - 1) * currentLimit;

    const where: Prisma.TransactionWhereInput = {
      userId: session.user.id,
      ...(type ? { type } : {}),
      ...(category ? { category } : {}),
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

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
        take: currentLimit,
      }),
      db.transaction.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page: currentPage,
      limit: currentLimit,
      pages: Math.ceil(total / currentLimit) || 1,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const validatedTransaction = createTransactionValidator.parse(body);

    // Convert date string to Date object
    const transactionData = {
      ...validatedTransaction,
      date: new Date(validatedTransaction.date),
      userId: session.user.id,
    };

    const transaction = await db.$transaction(async (prisma) => {
      const account = await prisma.financialAccount.findFirst({
        where: { id: validatedTransaction.accountId, userId: session.user.id },
      });
      if (!account) throw new Error('Account not found');

      const created = await prisma.transaction.create({
        data: transactionData,
      });
      await recomputeAccountBalance(
        prisma,
        transactionData.accountId,
        session.user.id
      );
      return created;
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid transaction data', details: error.errors },
        { status: 400 }
      );
    }

    // Handle known errors, including account not found
    if (error instanceof Error && error.message === 'Account not found') {
      return NextResponse.json(
        {
          error: 'Account not found',
          details: { name: error.name, message: error.message },
        },
        { status: 404 }
      );
    }

    // Handle Prisma errors and other known error types
    const errorDetails =
      error instanceof Error
        ? { name: error.name, message: error.message }
        : { name: 'Unknown', message: 'An unexpected error occurred' };

    return NextResponse.json(
      { error: 'Failed to create transaction', details: errorDetails },
      { status: 500 }
    );
  }
}

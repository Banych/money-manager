import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { recomputeAccountBalance } from '@/lib/transactions/balance';
import { createTransactionValidator } from '@/lib/validators/transaction.validator';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

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

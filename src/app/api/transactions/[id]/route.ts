import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { recomputeAccountBalance } from '@/lib/transactions/balance';
import { editTransactionValidator } from '@/lib/validators/transaction.validator';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const transaction = await db.transaction.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!transaction) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(transaction);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = editTransactionValidator.parse({ id, ...body });

    const result = await db.$transaction(async (prisma) => {
      const existing = await prisma.transaction.findFirst({
        where: { id, userId: session.user.id },
      });
      if (!existing) {
        throw new Error('NOT_FOUND');
      }

      const updated = await prisma.transaction.update({
        where: { id },
        data: {
          amount: parsed.amount ?? existing.amount,
          description: parsed.description ?? existing.description,
          type: parsed.type ?? existing.type,
          category: parsed.category ?? existing.category,
          date: parsed.date ? new Date(parsed.date) : existing.date,
        },
        include: {
          account: { select: { id: true, name: true, currency: true } },
        },
      });

      await recomputeAccountBalance(
        prisma,
        existing.accountId,
        session.user.id
      );
      return updated;
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.flatten() },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db.$transaction(async (prisma) => {
      const existing = await prisma.transaction.findFirst({
        where: { id, userId: session.user.id },
      });
      if (!existing) {
        throw new Error('NOT_FOUND');
      }
      await prisma.transaction.delete({ where: { id } });
      await recomputeAccountBalance(
        prisma,
        existing.accountId,
        session.user.id
      );
      return { success: true };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}

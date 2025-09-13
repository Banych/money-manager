import { getAuthSession } from '@/lib/auth';
import { getAccountTransactions } from '@/lib/queries/transactions';
import { transactionQuerySchema } from '@/lib/validators/transaction.query.validator';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
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

    const { page, limit, type, category, search, from, to } = parsed.data;
    const result = await getAccountTransactions({
      accountId: id,
      userId: session.user.id,
      page,
      limit,
      type,
      category,
      search,
      from,
      to,
    });

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

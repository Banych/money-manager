import { getAuthSession } from '@/lib/auth';
import { csvDownload, toCsv } from '@/lib/csv';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

const HEADERS = [
  'id',
  'date',
  'type',
  'amount',
  'currency',
  'accountId',
  'accountName',
  'category',
  'description',
  'receiptUrl',
  'createdAt',
] as const;

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactions = await db.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
      include: { account: { select: { name: true, currency: true } } },
    });

    const rows = transactions.map((transaction) => [
      transaction.id,
      transaction.date,
      transaction.type,
      transaction.amount,
      transaction.account.currency,
      transaction.accountId,
      transaction.account.name,
      transaction.category,
      transaction.description,
      transaction.receiptUrl,
      transaction.createdAt,
    ]);

    return csvDownload('transactions', toCsv(HEADERS, rows));
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error exporting transactions:', error);
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

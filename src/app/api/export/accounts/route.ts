import { getAuthSession } from '@/lib/auth';
import { csvDownload, toCsv } from '@/lib/csv';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

const HEADERS = [
  'id',
  'name',
  'type',
  'currency',
  'openingBalance',
  'balance',
  'createdAt',
] as const;

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accounts = await db.financialAccount.findMany({
      where: { userId: session.user.id },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });

    const rows = accounts.map((account) => [
      account.id,
      account.name,
      account.type,
      account.currency,
      account.openingBalance,
      account.balance,
      account.createdAt,
    ]);

    return csvDownload('accounts', toCsv(HEADERS, rows));
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error exporting accounts:', error);
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

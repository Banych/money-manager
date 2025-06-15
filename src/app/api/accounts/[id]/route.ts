import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { updateAccountValidator } from '@/lib/validators/account.validator';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  const { id } = await params;

  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await db.financialAccount.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json(account, { status: 200 });
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  const { id } = await params;

  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingAccount = await db.financialAccount.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const body = await request.json();
    const { balance, currency, name, type } =
      updateAccountValidator.parse(body);

    const account = await db.financialAccount.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        name,
        balance,
        currency,
        type,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Failed to update account' },
        { status: 500 }
      );
    }

    return NextResponse.json(account, { status: 200 });
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { createAccountValidator } from '@/lib/validators/account.validator';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accounts = await db.financialAccount.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        lastActivity: 'asc',
      },
    });

    return NextResponse.json(accounts, { status: 200 });
  } catch (error) {
    // Log error for debugging in development/staging
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching accounts:', error);
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createAccountValidator.parse({
      currency: 'EUR',
      type: 'CASH',
      ...body,
    });

    const account = await db.financialAccount.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid data provided', details: error.message },
        { status: 400 }
      );
    }

    // Log error for debugging in development/staging
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error creating account:', error);
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

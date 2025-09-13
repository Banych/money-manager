import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { updateAccountValidator } from '@/lib/validators/account.validator';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

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
    // Log error for debugging in development/staging
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Error fetching account:', error);
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

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

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate request body with proper error handling
    let validatedData;
    try {
      // Add the ID from URL params to the body for validation
      const bodyWithId = { ...body, id };
      validatedData = updateAccountValidator.parse(bodyWithId);
    } catch (validationError) {
      return NextResponse.json(
        {
          error: 'Invalid data provided',
          details:
            validationError instanceof Error
              ? validationError.message
              : 'Validation failed',
        },
        { status: 400 }
      );
    }

    const { balance, currency, name, type } = validatedData;

    // Build update data object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (balance !== undefined) updateData.balance = balance;
    if (currency !== undefined) updateData.currency = currency;
    if (type !== undefined) updateData.type = type;

    const account = await db.financialAccount.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: updateData,
    });

    return NextResponse.json(account, { status: 200 });
  } catch (error) {
    // Log error for debugging in development/staging
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Error updating account:', error);
    }

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Account name already exists' },
          { status: 409 }
        );
      }

      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Invalid data references' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingAccount = await db.financialAccount.findUnique({
      where: { id, userId: session.user.id },
      select: { id: true, balance: true },
    });
    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (existingAccount.balance !== 0) {
      return NextResponse.json(
        {
          error: 'NonZeroBalance',
          message: 'Account balance must be zero before deletion.',
          balance: existingAccount.balance,
        },
        { status: 409 }
      );
    }

    // Cascade deletes transactions via onDelete: Cascade relation
    await db.financialAccount.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Error deleting account:', error);
    }
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}

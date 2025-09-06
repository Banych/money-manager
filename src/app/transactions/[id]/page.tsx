import { getAuthSession } from '@/lib/auth';
import { formatDateTime } from '@/lib/date';
import { db } from '@/lib/db';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TransactionPage({ params }: Props) {
  const { id } = await params;

  const session = await getAuthSession();
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const transaction = await db.transaction.findUnique({
    where: {
      id,
      userId: session.user.id, // Add user ownership check
    },
    include: {
      account: {
        select: {
          name: true,
          currency: true,
        },
      },
    },
  });

  if (!transaction) {
    return (
      <div className="space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Transaction</h1>
        <p className="text-muted-foreground text-sm">Transaction not found.</p>
        <Link
          href="/accounts"
          className="text-primary text-sm underline"
        >
          Back to accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold">Transaction Detail</h1>
        <p className="text-muted-foreground text-sm">
          Created {formatDateTime(transaction.createdAt)}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-muted-foreground mb-1 text-xs uppercase">
            Amount
          </div>
          <div
            className={
              transaction.type === 'INCOME'
                ? 'font-semibold text-green-600'
                : 'font-semibold text-red-600'
            }
          >
            {transaction.type === 'INCOME' ? '+' : '-'}
            {transaction.amount.toFixed(2)} {transaction.account.currency}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-muted-foreground mb-1 text-xs uppercase">
            Type
          </div>
          <div className="font-semibold">{transaction.type}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-muted-foreground mb-1 text-xs uppercase">
            Category
          </div>
          <div className="font-semibold">{transaction.category || '—'}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-muted-foreground mb-1 text-xs uppercase">
            Date
          </div>
          <div className="font-semibold">
            {formatDateTime(transaction.date)}
          </div>
        </div>
        <div className="rounded-lg border p-4 md:col-span-2 lg:col-span-3">
          <div className="text-muted-foreground mb-1 text-xs uppercase">
            Description
          </div>
          <div className="font-semibold">{transaction.description || '—'}</div>
        </div>
      </div>
      <Link
        href={`/accounts/${transaction.accountId}`}
        className="text-primary text-sm underline"
      >
        View account
      </Link>
    </div>
  );
}

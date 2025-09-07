import BackButton from '@/components/back-button';
import DeleteTransactionButton from '@/components/transactions/delete-transaction-button';
import TransactionDetails from '@/components/transactions/transaction-details';
import { Button } from '@/components/ui/button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Pencil, Wallet } from 'lucide-react';
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
          id: true,
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
      <BackButton />
      <TransactionDetails initialTransaction={transaction} />

      <div className="flex flex-col space-y-2">
        <Button
          asChild
          size="sm"
        >
          <Link
            href={`/accounts/${transaction.accountId}`}
            className="text-primary text-sm underline"
          >
            <Wallet className="mr-2 inline h-4 w-4" />
            View account
          </Link>
        </Button>

        <Button
          asChild
          size="sm"
        >
          <Link
            href={`/transactions/${transaction.id}/edit`}
            className="text-primary text-sm underline"
          >
            <Pencil className="mr-2 inline h-4 w-4" />
            Edit transaction
          </Link>
        </Button>

        <DeleteTransactionButton transactionId={transaction.id} />
      </div>
    </div>
  );
}

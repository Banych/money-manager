import BackButton from '@/components/back-button';
import DeleteTransactionButton from '@/components/transactions/delete-transaction-button';
import TransactionDetails from '@/components/transactions/transaction-details';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Edit2, Wallet } from 'lucide-react';
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
      <div className="container mx-auto max-w-4xl p-6">
        <BackButton />
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Transaction Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The transaction you&apos;re looking for doesn&apos;t exist or you
              don&apos;t have permission to view it.
            </p>
            <Button asChild>
              <Link href="/accounts">
                <Wallet className="mr-2 h-4 w-4" />
                Back to Accounts
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <BackButton label="Return back" />

      <TransactionDetails initialTransaction={transaction} />

      {/* Actions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            {/* Primary Actions */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <Link href={`/accounts/${transaction.accountId}`}>
                  <Wallet className="mr-2 h-4 w-4" />
                  View Account
                </Link>
              </Button>

              <Button
                asChild
                size="sm"
              >
                <Link href={`/transactions/${transaction.id}/edit`}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Transaction
                </Link>
              </Button>

              <DeleteTransactionButton transactionId={transaction.id} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

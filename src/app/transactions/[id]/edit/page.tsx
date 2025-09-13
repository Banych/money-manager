import BackButton from '@/components/back-button';
import EditTransactionForm from '@/components/transactions/edit-transaction-form';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { forbidden, notFound } from 'next/navigation';
import { FC } from 'react';

type EditTransactionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const EditTransactionPage: FC<EditTransactionPageProps> = async ({
  params,
}) => {
  const { id } = await params;

  const session = await getAuthSession();

  if (!session?.user) {
    return forbidden();
  }

  const transaction = await db.transaction.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!transaction) {
    return notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-4 flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold">Edit Transaction</h1>
          <p className="text-muted-foreground">
            Edit the details of your transaction below.
          </p>
        </div>
      </div>
      <EditTransactionForm initialTransaction={transaction} />
    </div>
  );
};

export default EditTransactionPage;

import EditTransactionForm from '@/components/transactions/edit-transaction-form';
import InterceptedModal from '@/components/ui/intercepted-modal';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';

type EditTransactionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const { id } = await params;

  const session = await getAuthSession();

  if (!session?.user) {
    redirect('/auth/signin');
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
    <InterceptedModal
      title="Edit Transaction"
      description="Edit the details of your transaction below"
      maxWidth="md"
    >
      <EditTransactionForm initialTransaction={transaction} />
    </InterceptedModal>
  );
}

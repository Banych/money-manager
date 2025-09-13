import EditAccountForm from '@/components/accounts/edit-account-form';
import InterceptedModal from '@/components/ui/intercepted-modal';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { forbidden, notFound } from 'next/navigation';

type EditAccountPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditAccountPage({
  params,
}: EditAccountPageProps) {
  const { id } = await params;

  const session = await getAuthSession();

  if (!session?.user) {
    return forbidden();
  }

  const account = await db.financialAccount.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!account) {
    return notFound();
  }

  return (
    <InterceptedModal
      title="Edit Account"
      description="Update your account details below."
    >
      <EditAccountForm initialAccount={account} />
    </InterceptedModal>
  );
}

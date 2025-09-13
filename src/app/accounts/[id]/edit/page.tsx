import EditAccountForm from '@/components/accounts/edit-account-form';
import BackButton from '@/components/back-button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { forbidden, notFound } from 'next/navigation';
import { FC } from 'react';

type EditAccountPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const EditAccountPage: FC<EditAccountPageProps> = async ({ params }) => {
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
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-4 flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold">Edit Account</h1>
          <p className="text-muted-foreground">
            Edit the details of your account below.
          </p>
        </div>
      </div>
      <EditAccountForm initialAccount={account} />
    </div>
  );
};

export default EditAccountPage;

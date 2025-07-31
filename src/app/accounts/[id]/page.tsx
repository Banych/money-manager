import AccountActions from '@/components/accounts/account-actions';
import AccountOverview from '@/components/accounts/account-overview';
import AccountStats from '@/components/accounts/account-stats';
import RecentTransactions from '@/components/accounts/recent-transactions';
import { Button } from '@/components/ui/button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type AccountPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: AccountPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return { title: 'Account Details - Money Manager' };
    }

    const account = await db.financialAccount.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return {
      title: account
        ? `${account.name} - Money Manager`
        : 'Account Not Found - Money Manager',
      description: account
        ? `View details and transactions for ${account.name}`
        : 'Account not found',
    };
  } catch {
    return { title: 'Account Details - Money Manager' };
  }
}

const AccountPage = async ({ params }: AccountPageProps) => {
  const { id } = await params;

  const session = await getAuthSession();

  if (!session?.user) {
    notFound();
  }

  const account = await db.financialAccount.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!account) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Link href="/accounts">
          <Button
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Accounts
          </Button>
        </Link>
      </div>

      {/* Account Overview */}
      <AccountOverview account={account} />

      {/* Statistics */}
      <AccountStats account={account} />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Transactions - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <RecentTransactions account={account} />
        </div>

        {/* Account Actions - Takes 1 column on large screens */}
        <AccountActions account={account} />
      </div>
    </div>
  );
};

export default AccountPage;

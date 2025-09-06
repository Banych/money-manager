import AccountsList from '@/components/accounts/accounts-list';
import AddAccountButton from '@/components/accounts/add-account-button';
import { getAuthSession } from '@/lib/auth';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Accounts - Money Manager',
  description: 'Manage your financial accounts',
};

export default async function AccountsPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Financial Accounts
        </h1>
        <p className="text-muted-foreground">
          Manage your wallets, bank accounts, and cards
        </p>
      </div>

      <AccountsList AddAccountComponent={<AddAccountButton />} />
    </div>
  );
}

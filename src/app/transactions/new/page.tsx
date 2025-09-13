import BackButton from '@/components/back-button';
import TransactionForm from '@/components/transactions/create-transaction-form';
import { TransactionType } from '@/generated/prisma';

type NewTransactionPageProps = {
  searchParams?: Promise<{
    type?: TransactionType;
    accountId?: string;
  }>;
};

export default async function NewTransactionPage({
  searchParams,
}: NewTransactionPageProps) {
  const { type, accountId } = (await searchParams) || {};

  const getPageTitle = () => {
    if (type === TransactionType.INCOME) return 'Add Income';
    if (type === TransactionType.EXPENSE) return 'Add Expense';
    return 'Add Transaction';
  };

  const getPageDescription = () => {
    if (type === TransactionType.INCOME) {
      return 'Record income to your account';
    }
    if (type === TransactionType.EXPENSE) {
      return 'Record an expense from your account';
    }
    return 'Add a new income or expense transaction';
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-4 flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
          <p className="text-muted-foreground">{getPageDescription()}</p>
        </div>
      </div>

      <TransactionForm
        defaultType={type}
        defaultAccountId={accountId}
      />
    </div>
  );
}

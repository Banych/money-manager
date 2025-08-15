import TransactionForm from '@/components/transactions/transaction-form';
import InterceptedModal from '@/components/ui/intercepted-modal';
import { TransactionType } from '@/generated/prisma';
import {
  getTransactionPageDescription,
  getTransactionPageTitle,
} from '@/lib/utils';

type NewTransactionPageProps = {
  searchParams?: Promise<{
    type?: TransactionType;
    accountId?: string;
  }>;
};

export default async function InterceptedNewTransactionPage({
  searchParams,
}: NewTransactionPageProps) {
  const { type, accountId } = (await searchParams) || {};

  const title = getTransactionPageTitle(type);
  const description = getTransactionPageDescription(type);

  return (
    <InterceptedModal
      title={title}
      description={description}
      maxWidth="md"
    >
      <TransactionForm
        defaultAccountId={accountId}
        defaultType={type}
      />
    </InterceptedModal>
  );
}

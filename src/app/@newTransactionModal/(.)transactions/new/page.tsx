'use client';

import TransactionFormWrapper from '@/components/transactions/transaction-form-wrapper';
import { useTransactionModalContent } from '@/components/transactions/transaction-modal-content';
import InterceptedModal from '@/components/ui/intercepted-modal';

export const dynamic = 'force-static';

export default function InterceptedNewTransactionPage() {
  const { title, description } = useTransactionModalContent();

  return (
    <InterceptedModal
      title={title}
      description={description}
      maxWidth="md"
    >
      {({ onClose }) => <TransactionFormWrapper onClose={onClose} />}
    </InterceptedModal>
  );
}

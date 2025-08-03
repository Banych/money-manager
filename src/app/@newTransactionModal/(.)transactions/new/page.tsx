'use client';

import TransactionFormWrapper from '@/components/transactions/transaction-form-wrapper';
import { useTransactionModalContent } from '@/components/transactions/transaction-modal-content';
import InterceptedModal from '@/components/ui/intercepted-modal';
import Loader from '@/components/ui/loader';
import { Suspense } from 'react';

function TransactionModalContent() {
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

export default function InterceptedNewTransactionPage() {
  return (
    <Suspense fallback={<Loader />}>
      <TransactionModalContent />
    </Suspense>
  );
}

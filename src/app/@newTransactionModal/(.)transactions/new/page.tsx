'use client';

import TransactionFormWrapper from '@/components/transactions/transaction-form-wrapper';
import { useTransactionModalContent } from '@/components/transactions/transaction-modal-content';
import InterceptedModal from '@/components/ui/intercepted-modal';
import Loader from '@/components/ui/loader';
import { Suspense } from 'react';

export const dynamic = 'force-static';

export default function InterceptedNewTransactionPage() {
  const { title, description } = useTransactionModalContent();

  return (
    <Suspense fallback={<Loader />}>
      <InterceptedModal
        title={title}
        description={description}
        maxWidth="md"
      >
        {({ onClose }) => <TransactionFormWrapper onClose={onClose} />}
      </InterceptedModal>
    </Suspense>
  );
}

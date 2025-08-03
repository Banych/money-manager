'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import TransactionForm from './transaction-form';

interface TransactionFormWrapperProps {
  onClose?: () => void;
}

export default function TransactionFormWrapper({
  onClose,
}: TransactionFormWrapperProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleSuccess = () => {
    onClose?.();
    router.push('/transactions');
  };

  const handleCancel = () => {
    onClose?.();
    router.back();
  };

  if (status === 'loading') {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <TransactionForm
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}

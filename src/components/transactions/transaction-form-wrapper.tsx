'use client';

import { TransactionType } from '@/generated/prisma';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import TransactionForm from './transaction-form';

interface TransactionFormWrapperProps {
  onClose?: () => void;
  defaultType?: TransactionType;
  defaultAccountId?: string;
}

export default function TransactionFormWrapper({
  onClose,
  defaultType,
  defaultAccountId,
}: TransactionFormWrapperProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <TransactionForm
      onClose={onClose}
      defaultType={defaultType}
      defaultAccountId={defaultAccountId}
    />
  );
}

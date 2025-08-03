'use client';

import { TransactionType } from '@/generated/prisma';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const params = useSearchParams();

  const type = (params.get('type') as TransactionType) ?? undefined;
  const accountId = (params.get('accountId') as string) ?? undefined;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-8">
        <div>Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center py-8">
        <div>Please sign in to continue.</div>
      </div>
    );
  }

  return (
    <TransactionForm
      onClose={onClose}
      defaultType={type}
      defaultAccountId={accountId}
    />
  );
}

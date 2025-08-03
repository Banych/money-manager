'use client';

import { TransactionType } from '@/generated/prisma';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (!mounted || status === 'loading') {
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
      defaultType={defaultType}
      defaultAccountId={defaultAccountId}
    />
  );
}

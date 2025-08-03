'use client';

import TransactionFormWrapper from '@/components/transactions/transaction-form-wrapper';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TransactionType } from '@/generated/prisma';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function TransactionModalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Extract query parameters with safety checks
  const type = searchParams?.get('type') as TransactionType | null;
  const accountId = searchParams?.get('accountId') || undefined;

  useEffect(() => {
    setMounted(true);
    setOpen(true);
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setOpen(false);
      router.back();
    }
  };

  const getDialogTitle = () => {
    if (type === TransactionType.INCOME) return 'Add Income';
    if (type === TransactionType.EXPENSE) return 'Add Expense';
    return 'Add Transaction';
  };

  const getDialogDescription = () => {
    if (type === TransactionType.INCOME) {
      return 'Record income to your account.';
    }
    if (type === TransactionType.EXPENSE) {
      return 'Record an expense from your account.';
    }
    return 'Add a new income or expense transaction.';
  };

  // Ensure component is mounted before rendering dialog
  if (!mounted) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="mx-4 max-h-full max-w-sm overflow-y-auto sm:max-w-md md:max-h-[90vh]">
        <DialogHeader className="pb-4 text-left">
          <DialogTitle className="text-lg sm:text-xl">
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto">
          <TransactionFormWrapper
            onClose={() => setOpen(false)}
            defaultType={type || undefined}
            defaultAccountId={accountId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function InterceptedNewTransactionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[200px] items-center justify-center">
          <div>Loading transaction form...</div>
        </div>
      }
    >
      <TransactionModalContent />
    </Suspense>
  );
}

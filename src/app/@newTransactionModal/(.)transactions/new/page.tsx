'use client';

import TransactionFormWrapper from '@/components/transactions/transaction-form-wrapper';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function TransactionModalContent() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setOpen(false);
      router.back();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="mx-4 max-h-full max-w-sm overflow-y-auto sm:max-w-md md:max-h-[90vh]">
        <DialogHeader className="pb-4 text-left">
          <DialogTitle className="text-lg sm:text-xl">
            Add Transaction
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Record a new transaction to your account.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto">
          <TransactionFormWrapper onClose={() => setOpen(false)} />
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

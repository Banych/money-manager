'use client';

import AddAccountFormWrapper from '@/components/accounts/add-account-form-wrapper';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const dynamic = 'force-static';

export default function InterceptedAddAccountPage() {
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
            Add Financial Account
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Create a new account to track your finances.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto">
          <AddAccountFormWrapper onClose={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

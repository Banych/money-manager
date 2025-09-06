'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useDeleteAccount } from '@/hooks/useAccounts';
import { cn } from '@/lib/utils';
import { ClassValue } from 'clsx';
import { Trash2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface DeleteAccountButtonProps {
  accountId: string;
  accountName: string;
  className?: ClassValue;
  variant?: 'button' | 'menu';
  redirectOnDeleteTo?: string; // default /accounts
}

export function DeleteAccountButton({
  accountId,
  accountName,
  className,
  variant = 'button',
  redirectOnDeleteTo = '/accounts',
}: DeleteAccountButtonProps) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const { mutate: deleteAccount, isPending } = useDeleteAccount();
  const router = useRouter();
  const pathname = usePathname();

  const requiresNameConfirm = accountName.length > 12; // heuristic for "large" / important
  const canConfirm = !requiresNameConfirm || confirmText === accountName;

  const handleConfirm = () => {
    setServerError(null);
    deleteAccount(accountId, {
      onSuccess: () => {
        setOpen(false);
        setConfirmText('');
        if (pathname?.includes(accountId)) {
          router.push(redirectOnDeleteTo);
        }
      },
      onError: (err: unknown) => {
        // detect 409 shape
        if (err instanceof Error && err.message.includes('NonZeroBalance')) {
          setServerError('Balance must be zero before deletion.');
        } else {
          setServerError('Failed to delete account');
        }
      },
    });
  };

  const trigger = (
    <Button
      variant={variant === 'button' ? 'destructive' : 'ghost'}
      size={variant === 'button' ? 'sm' : 'sm'}
      className={cn('justify-start', className)}
      disabled={isPending}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isPending ? 'Deleting...' : 'Delete Account'}
    </Button>
  );

  return (
    <AlertDialog
      open={open}
      onOpenChange={setOpen}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete account</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{accountName}</strong> and all
            its transactions. This action cannot be undone.
          </AlertDialogDescription>
          {requiresNameConfirm && (
            <div className="mt-4 space-y-2 text-sm">
              <p>
                Type the account name{' '}
                <code className="bg-muted rounded px-1">{accountName}</code> to
                confirm.
              </p>
              <input
                autoFocus
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={accountName}
                className="border-input bg-background w-full rounded border px-2 py-1 text-sm"
              />
            </div>
          )}
          {serverError && (
            <p className="mt-2 text-sm text-red-600">{serverError}</p>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending || !canConfirm}
          >
            {isPending ? 'Deleting...' : canConfirm ? 'Confirm' : 'Type name'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteAccountButton;

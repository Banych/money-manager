'use client';

import {
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
import { useDeleteTransaction } from '@/hooks/useTransactions';
import { AlertDialog } from '@radix-ui/react-alert-dialog';
import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC } from 'react';

type DeleteTransactionButtonProps = {
  transactionId: string;
};

const DeleteTransactionButton: FC<DeleteTransactionButtonProps> = ({
  transactionId,
}) => {
  const { mutate: deleteTransaction, isPending: isDeleting } =
    useDeleteTransaction();
  const router = useRouter();

  const handleDelete = () => {
    deleteTransaction(transactionId, {
      onSuccess: () => {
        router.back();
      },
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={isDeleting}
        >
          <Trash className="size-4" />
          Delete Transaction
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this transaction? This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash className="size-4" />
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTransactionButton;

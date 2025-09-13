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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteTransaction } from '@/hooks/useTransactions';
import { Edit, Eye, MoreVertical, Trash } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface TransactionActionMenuProps {
  transaction: {
    id: string;
    account?: {
      id: string;
      name: string;
      currency: string;
    };
  };
  showViewOption?: boolean;
}

export default function TransactionActionMenu({
  transaction,
  showViewOption = true,
}: TransactionActionMenuProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { mutate: deleteTransaction, isPending: isDeleting } =
    useDeleteTransaction();

  const handleDelete = () => {
    deleteTransaction(transaction.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {showViewOption && (
            <>
              <DropdownMenuItem asChild>
                <Link href={`/transactions/${transaction.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem asChild>
            <Link href={`/transactions/${transaction.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Transaction
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteDialogOpen(true);
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Transaction
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action
              cannot be undone and will update your account balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Transaction'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

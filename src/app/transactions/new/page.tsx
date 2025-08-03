'use client';

import TransactionFormWrapper from '@/components/transactions/transaction-form-wrapper';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TransactionType } from '@/generated/prisma';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function TransactionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = searchParams.get('type') as TransactionType | null;

  const getPageTitle = () => {
    if (type === TransactionType.INCOME) return 'Add Income';
    if (type === TransactionType.EXPENSE) return 'Add Expense';
    return 'Add Transaction';
  };

  const getPageDescription = () => {
    if (type === TransactionType.INCOME) {
      return 'Record income to your account';
    }
    if (type === TransactionType.EXPENSE) {
      return 'Record an expense from your account';
    }
    return 'Add a new income or expense transaction';
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
          <p className="text-muted-foreground">{getPageDescription()}</p>
        </div>
      </div>

      {/* Transaction Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{getPageTitle()}</CardTitle>
          <CardDescription>{getPageDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionFormWrapper onClose={handleClose} />
        </CardContent>
      </Card>
    </div>
  );
}

function TransactionPageLoading() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
        <div>
          <div className="mb-2 h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-5 w-64 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="mb-2 h-6 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewTransactionPage() {
  return (
    <Suspense fallback={<TransactionPageLoading />}>
      <TransactionPageContent />
    </Suspense>
  );
}

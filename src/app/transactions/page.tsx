import TransactionsPageClient from '@/components/transactions/transactions-page-client';
import { INFINITE_TRANSACTIONS_LIMIT } from '@/constants/transactions';
import { TransactionType } from '@/generated/prisma';
import { getAuthSession } from '@/lib/auth';
import { getAllTransactions } from '@/lib/queries/transactions';
import { forbidden } from 'next/navigation';

interface TransactionsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    type?: TransactionType;
    category?: string;
    from?: string;
    to?: string;
    search?: string;
  }>;
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const session = await getAuthSession();

  if (!session?.user) {
    return forbidden();
  }

  const params = await searchParams;

  // Parse search params with defaults
  const page = 1; // Always start at page 1 for initial load
  const limit = INFINITE_TRANSACTIONS_LIMIT;
  const type = params.type;
  const category = params.category;
  const from = params.from ? new Date(params.from) : undefined;
  const to = params.to ? new Date(params.to) : undefined;
  const search = params.search;

  // Fetch initial data server-side for SEO and initial render
  const initialData = await getAllTransactions({
    userId: session.user.id,
    page,
    limit,
    type,
    category,
    from,
    to,
    search,
  });

  return (
    <TransactionsPageClient
      initialData={initialData}
      initialParams={{
        limit,
        type,
        category,
        from,
        to,
        search,
      }}
    />
  );
}

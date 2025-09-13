'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import EmptyState from '@/components/ui/empty-state';
import { TransactionType } from '@/generated/prisma';
import { useInfiniteAllTransactions } from '@/hooks/useTransactions';
import { TransactionListResult } from '@/lib/queries/transactions';
import { useIntersection } from '@mantine/hooks';
import { ArrowDown, Banknote, Calendar, Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import FilterHeader from './filter-header';
import TransactionFilters from './transaction-filters';
import TransactionListItem from './transaction-list-item';

interface TransactionsPageClientProps {
  initialData: TransactionListResult;
  initialParams: {
    limit: number;
    type?: TransactionType;
    category?: string;
    from?: Date;
    to?: Date;
    search?: string;
  };
}

const TransactionsPageClient = ({
  initialData,
  initialParams,
}: TransactionsPageClientProps) => {
  const router = useRouter();
  const pathname = usePathname();

  // Filter states
  const [search, setSearch] = useState(() => initialParams.search || '');
  const [type, setType] = useState(() => initialParams.type);
  const [category, setCategory] = useState(() => initialParams.category);
  const [fromDate, setFromDate] = useState(() => initialParams.from);
  const [toDate, setToDate] = useState(() => initialParams.to);
  const [showFilters, setShowFilters] = useState(false);

  const [limit] = useState(() => initialParams.limit);

  const lastTransactionRef = useRef<HTMLLIElement | null>(null);
  const { ref, entry } = useIntersection({
    root: lastTransactionRef.current,
    threshold: 1,
  });

  // React Query with initial data
  const { data, isFetching, isError, hasNextPage, fetchNextPage, refetch } =
    useInfiniteAllTransactions(
      {
        limit,
        type,
        category,
        from: fromDate,
        to: toDate,
        search: search || undefined,
      },
      {
        initialData: {
          pages: [initialData],
          pageParams: [1],
        },
        getNextPageParam: (lastPage, pages, lastPageParam) => {
          // If the number of items returned is less than the limit, there are no more pages
          if (lastPage.data.length < limit) {
            return undefined;
          }
          return Number(lastPageParam) + 1;
        },
        initialPageParam: 1,
      }
    );

  const transactions = data?.pages.flatMap((page) => page.data) || [];
  const total = data.pages.at(-1)?.total || 0;

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (type) params.set('type', type);
    if (category) params.set('category', category);
    if (fromDate) params.set('from', fromDate.toISOString());
    if (toDate) params.set('to', toDate.toISOString());
    if (search) params.set('search', search);

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    router.push(newUrl, { scroll: false });
  }, [limit, type, category, fromDate, toDate, search, router, pathname]);

  const handleClearFilters = () => {
    setSearch('');
    setType(undefined);
    setCategory(undefined);
    setFromDate(undefined);
    setToDate(undefined);
  };

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage) {
      fetchNextPage();
    }
  }, [entry, hasNextPage, isFetching, fetchNextPage]);

  const hasActiveFilters = Boolean(
    search || type || category || fromDate || toDate
  );

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-red-600">Failed to load transactions.</p>
            <Button
              onClick={() => refetch()}
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">All Transactions</h1>
        <p className="text-muted-foreground mt-2">
          {isFetching ? 'Loading...' : `${total} transactions found`}
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <FilterHeader
            hasActiveFilters={hasActiveFilters}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onClearFilters={handleClearFilters}
          />
        </CardHeader>

        {showFilters && (
          <CardContent>
            <TransactionFilters
              search={search}
              onSearchChange={setSearch}
              type={type}
              onTypeChange={setType}
              category={category}
              onCategoryChange={setCategory}
              fromDate={fromDate}
              onFromDateChange={setFromDate}
              toDate={toDate}
              onToDateChange={setToDate}
            />
          </CardContent>
        )}
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Transactions</h2>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-12 w-12" />}
              title="No transactions found"
              description={
                hasActiveFilters
                  ? 'Try adjusting your filters to see more results.'
                  : 'Start by adding your first transaction.'
              }
            />
          ) : (
            <ul className="list-none space-y-3">
              {transactions.map((transaction, index) => (
                <TransactionListItem
                  ref={index === transactions.length - 1 ? ref : null}
                  key={transaction.id}
                  transaction={transaction}
                  showAccount={true}
                />
              ))}

              {/* Load more block */}
              <li className="flex items-center justify-center gap-x-4 text-sm text-zinc-500">
                {isFetching ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Loading more transactions...
                  </>
                ) : hasNextPage ? (
                  <>
                    <ArrowDown className="size-4" />
                    Scroll down to load more transactions
                  </>
                ) : (
                  <>
                    <Banknote className="size-4" />
                    Seeing all transactions
                  </>
                )}
              </li>
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

TransactionsPageClient.displayName = 'TransactionsPageClient';

export default TransactionsPageClient;

'use client';

import BackButton from '@/components/back-button';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TransactionType } from '@/generated/prisma';
import { useAccounts } from '@/hooks/useAccounts';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { formatISO } from '@/lib/date';
import {
  CreateTransactionData,
  createTransactionValidator,
} from '@/lib/validators/transaction.validator';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

const DEFAULT_CATEGORIES = {
  INCOME: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  EXPENSE: [
    'Food & Groceries',
    'Transportation',
    'Entertainment',
    'Bills & Utilities',
    'Shopping',
    'Healthcare',
    'Education',
    'Other',
  ],
};

type TransactionFormProps = {
  defaultType?: TransactionType;
  defaultAccountId?: string;
};

const TransactionForm = ({
  defaultType,
  defaultAccountId,
}: TransactionFormProps) => {
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { mutate: createTransaction, isPending } = useCreateTransaction();

  const isAccountsEmpty =
    (!accounts || accounts.length === 0) && !accountsLoading;

  const form = useForm<CreateTransactionData>({
    resolver: zodResolver(createTransactionValidator),
    defaultValues: {
      amount: 0,
      description: '',
      type: defaultType || TransactionType.EXPENSE,
      category: '',
      date: formatISO(new Date()),
      accountId: defaultAccountId || '',
    },
  });

  const selectedType = form.watch('type');

  // Set default account if provided
  useEffect(() => {
    if (defaultAccountId && accounts?.length) {
      const account = accounts.find((acc) => acc.id === defaultAccountId);
      if (account) {
        form.setValue('accountId', defaultAccountId);
      }
    }
  }, [defaultAccountId, accounts, form]);

  const onSubmit = (data: CreateTransactionData) => {
    // Clean up the data before sending
    const cleanedData = {
      ...data,
      description: data.description?.trim() || undefined,
      category: data.category?.trim() || undefined,
    };

    createTransaction(cleanedData, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Transaction Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={TransactionType.INCOME}>Income</SelectItem>
                  <SelectItem value={TransactionType.EXPENSE}>
                    Expense
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    field.onChange(isNaN(value) ? 0 : value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Account Selection */}
        {accountsLoading ? (
          <div className="py-4 text-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : isAccountsEmpty ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              You need to create an account first before adding transactions.
            </p>
            <Button
              asChild
              className="mt-4"
            >
              <Link href="/accounts/new">Create Account</Link>
            </Button>
          </div>
        ) : (
          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts?.map((account) => (
                      <SelectItem
                        key={account.id}
                        value={account.id}
                      >
                        {account.name} ({account.currency}{' '}
                        {account.balance.toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter transaction description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category (Optional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DEFAULT_CATEGORIES[selectedType]?.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <BackButton
            label="Cancel"
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isPending}
            className="flex-1"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {selectedType === TransactionType.INCOME
              ? 'Add Income'
              : 'Add Expense'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

TransactionForm.displayName = 'TransactionForm';

export default TransactionForm;

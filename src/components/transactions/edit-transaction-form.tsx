'use client';

import BackButton from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useInterceptedModal } from '@/components/ui/intercepted-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { Transaction, TransactionType } from '@/generated/prisma';
import { useUpdateTransaction } from '@/hooks/useTransactions';
import { formatDateTime } from '@/lib/date';
import {
  EditTransactionData,
  editTransactionValidator,
} from '@/lib/validators/transaction.validator';
import { zodResolver } from '@hookform/resolvers/zod';
import { FC } from 'react';
import { useForm } from 'react-hook-form';

type EditTransactionFormProps = {
  initialTransaction: Transaction;
};

const EditTransactionForm: FC<EditTransactionFormProps> = ({
  initialTransaction,
}) => {
  const { mutate: updateTransaction, isPending: isUpdateTransactionPending } =
    useUpdateTransaction();
  const modal = useInterceptedModal();

  const form = useForm<EditTransactionData>({
    resolver: zodResolver(editTransactionValidator),
    defaultValues: {
      id: initialTransaction.id,
      amount: initialTransaction.amount,
      description: initialTransaction.description || '',
      date: initialTransaction.date.toISOString().slice(0, 16),
      category: initialTransaction.category || 'Other',
      type: initialTransaction.type || TransactionType.EXPENSE,
    },
    mode: 'onBlur',
  });

  const selectedType = form.watch('type');

  const onSubmit = (data: EditTransactionData) => {
    updateTransaction(data, {
      onSuccess: () => {
        modal?.onClose();
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
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
                  {selectedType &&
                    DEFAULT_CATEGORIES[selectedType]?.map((category) => (
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
                <DateTimePicker
                  {...field}
                  onChange={(date) => {
                    field.onChange(date ? formatDateTime(date) : '');
                  }}
                  value={field.value ? new Date(field.value) : new Date()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <BackButton
            label="Cancel"
            className="flex-1"
          />
          <Button
            type="submit"
            className="flex-1"
            disabled={isUpdateTransactionPending}
          >
            {isUpdateTransactionPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditTransactionForm;

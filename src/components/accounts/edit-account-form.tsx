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
import { useInterceptedModal } from '@/components/ui/intercepted-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { accountTypeLabels, supportedCurrencies } from '@/constants/accounts';
import { FinancialAccount } from '@/generated/prisma';
import { useUpdateAccount } from '@/hooks/useAccounts';
import {
  UpdateAccountData,
  updateAccountValidator,
} from '@/lib/validators/account.validator';
import { zodResolver } from '@hookform/resolvers/zod';
import { FC } from 'react';
import { useForm } from 'react-hook-form';

type EditAccountFormProps = {
  initialAccount: FinancialAccount;
};

const EditAccountForm: FC<EditAccountFormProps> = ({ initialAccount }) => {
  const { mutate: updateAccount, isPending: isUpdateAccountPending } =
    useUpdateAccount();
  const modal = useInterceptedModal();

  const form = useForm<UpdateAccountData>({
    resolver: zodResolver(updateAccountValidator),
    defaultValues: {
      id: initialAccount.id,
      name: initialAccount.name,
      balance: initialAccount.balance,
      currency: initialAccount.currency,
      type: initialAccount.type,
    },
    mode: 'onBlur',
  });

  const onSubmit = (data: UpdateAccountData) => {
    updateAccount(data, {
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Main Wallet, Chase Checking"
                  {...field}
                  disabled={isUpdateAccountPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger disabled={isUpdateAccountPending}>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(accountTypeLabels).map(([value, label]) => (
                    <SelectItem
                      key={value}
                      value={value}
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-4">
          <FormField
            control={form.control}
            name="balance"
            render={({ field }) => (
              <FormItem className="grow">
                <FormLabel>Current Balance</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                    disabled={isUpdateAccountPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger disabled={isUpdateAccountPending}>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {supportedCurrencies.map(({ code, label }) => (
                      <SelectItem
                        key={code}
                        value={code}
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <BackButton
            label="Cancel"
            className="flex-1"
          />
          <Button
            type="submit"
            className="flex-1"
            disabled={isUpdateAccountPending}
          >
            {isUpdateAccountPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditAccountForm;

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialAccount, TransactionType } from '@/generated/prisma';
import {
  Edit3,
  Plus,
  Settings,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

interface AccountActionsProps {
  account: FinancialAccount;
}

export default function AccountActions({ account }: AccountActionsProps) {
  const handleEditAccount = () => {
    // TODO: Implement edit account functionality
  };

  const handleAccountSettings = () => {
    // TODO: Implement account settings functionality
  };

  const handleDeleteAccount = () => {
    // TODO: Implement delete account functionality
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Account Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transaction Actions */}
        <div className="space-y-2">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Transactions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              asChild
              className="h-auto justify-start p-3"
              variant="outline"
            >
              <Link
                href={`/transactions/new?type=${TransactionType.INCOME}&accountId=${account.id}`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium">Add Income</div>
                    <div className="text-muted-foreground text-xs">
                      Credit transaction
                    </div>
                  </div>
                </div>
              </Link>
            </Button>

            <Button
              asChild
              className="h-auto justify-start p-3"
              variant="outline"
            >
              <Link
                href={`/transactions/new?type=${TransactionType.EXPENSE}&accountId=${account.id}`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <div className="text-left">
                    <div className="font-medium">Add Expense</div>
                    <div className="text-muted-foreground text-xs">
                      Debit transaction
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </div>

        {/* Account Management */}
        <div className="space-y-2">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Account Management
          </h3>
          <div className="space-y-2">
            <Button
              onClick={handleEditAccount}
              className="w-full justify-start"
              variant="outline"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Account Details
            </Button>

            <Button
              onClick={handleAccountSettings}
              className="w-full justify-start"
              variant="outline"
            >
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
            </Button>
          </div>
        </div>

        {/* Quick Add */}
        <div className="space-y-2">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Quick Actions
          </h3>
          <Button
            asChild
            className="w-full"
            size="lg"
          >
            <Link href={`/transactions/new?accountId=${account.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Transaction
            </Link>
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="space-y-2 border-t pt-4">
          <h3 className="text-sm font-medium tracking-wide text-red-600 uppercase">
            Danger Zone
          </h3>
          <Button
            onClick={handleDeleteAccount}
            className="w-full justify-start"
            variant="destructive"
            size="sm"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
          <p className="text-muted-foreground text-xs">
            This action cannot be undone. All transaction history will be lost.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

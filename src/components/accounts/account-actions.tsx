'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialAccount } from '@/generated/prisma';
import {
  Edit3,
  Plus,
  Settings,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface AccountActionsProps {
  account: FinancialAccount;
}

export default function AccountActions({
  account: _account,
}: AccountActionsProps) {
  const handleEditAccount = () => {
    console.log('Edit account functionality triggered.');
  };

  const handleAddTransaction = (_type: 'income' | 'expense') => {
    console.log(`Add transaction functionality triggered for type: ${_type}.`);
  };

  const handleAccountSettings = () => {
    console.log('Account settings functionality triggered.');
  };

  const handleDeleteAccount = () => {
    console.log('Delete account functionality triggered.');
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
              onClick={() => handleAddTransaction('income')}
              className="h-auto justify-start p-3"
              variant="outline"
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
            </Button>

            <Button
              onClick={() => handleAddTransaction('expense')}
              className="h-auto justify-start p-3"
              variant="outline"
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
            onClick={() => handleAddTransaction('expense')}
            className="w-full"
            size="lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Transaction
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

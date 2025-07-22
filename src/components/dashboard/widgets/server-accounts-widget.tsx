import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatBalance } from '@/constants/accounts';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  CreditCard,
  Eye,
  PiggyBank,
  Plus,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';

export default async function ServerAccountsWidget() {
  const session = await getAuthSession();

  if (!session?.user) {
    return (
      <div className="text-center">Please sign in to view your accounts.</div>
    );
  }

  // Get accounts with more detailed information
  // Fetch both accounts and total count in parallel for efficiency
  const [accounts, accountsAmount] = await Promise.all([
    db.financialAccount.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        balance: 'desc',
      },
      take: 3, // Show top 3 accounts
    }),
    db.financialAccount.count({
      where: {
        userId: session.user.id,
      },
    }),
  ]);

  // Calculate total balance by currency
  const balanceByCurrency = accounts.reduce(
    (acc, account) => {
      if (!acc[account.currency]) {
        acc[account.currency] = 0;
      }
      acc[account.currency] += account.balance;
      return acc;
    },
    {} as Record<string, number>
  );

  // Get the primary currency (most used)
  const primaryCurrency =
    Object.keys(balanceByCurrency).sort(
      (a, b) => balanceByCurrency[b] - balanceByCurrency[a]
    )[0] || 'EUR';

  const totalBalance = balanceByCurrency[primaryCurrency] || 0;

  // Get account type icons
  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'BANK_ACCOUNT':
        return <CreditCard className="h-4 w-4" />;
      case 'SAVINGS':
        return <PiggyBank className="h-4 w-4" />;
      case 'CASH':
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  // Calculate if balance is trending up (mock for now)
  const isPositiveTrend = totalBalance > 0; // This would be based on historical data

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-600" />
          Financial Accounts
          {accountsAmount > 0 && (
            <Badge
              variant="secondary"
              className="ml-auto"
            >
              {accountsAmount}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Your money across all accounts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Balance Display */}
        <div className="rounded-lg bg-blue-50 p-4 text-center">
          <div className="mb-1 flex items-center justify-center gap-2">
            <p className="text-2xl font-bold text-blue-600">
              {formatBalance(totalBalance, primaryCurrency)}
            </p>
            {isPositiveTrend && (
              <TrendingUp className="h-5 w-5 text-green-600" />
            )}
          </div>
          <p className="text-sm text-gray-600">Total Balance</p>
          {Object.keys(balanceByCurrency).length > 1 && (
            <p className="mt-1 text-xs text-gray-500">
              {Object.keys(balanceByCurrency).length} currencies
            </p>
          )}
        </div>

        {/* Account Preview */}
        {accounts.length > 0 ? (
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700">
              Recent Accounts
            </h4>
            <div className="max-h-24 space-y-2 overflow-y-auto">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded bg-gray-50 p-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="text-gray-600">
                      {getAccountIcon(account.type)}
                    </div>
                    <span className="max-w-20 truncate font-medium">
                      {account.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatBalance(account.balance, account.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <Wallet className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-500">No accounts yet</p>
            <p className="text-xs text-gray-400">
              Create your first account to get started
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            asChild
            size="sm"
            className="flex-1"
          >
            <Link href="/accounts/new">
              <Plus className="mr-1 h-4 w-4" />
              Add Account
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Link href="/accounts">
              <Eye className="mr-1 h-4 w-4" />
              View All
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

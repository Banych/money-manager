import AnalyticsWidget from '@/components/dashboard/widgets/analytics-widget';
import ExpensesIncomeWidget from '@/components/dashboard/widgets/expenses-income-widget';
import GroceryWidget from '@/components/dashboard/widgets/grocery-widget';
import PlannedPurchasesWidget from '@/components/dashboard/widgets/planned-purchases-widget';
import ServerAccountsWidget from '@/components/dashboard/widgets/server-accounts-widget';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getAuthSession } from '@/lib/auth';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard - Money Manager',
  description: 'Your personal finance dashboard',
};

export default async function Dashboard() {
  const session = await getAuthSession();

  // Redirect unauthenticated users to homepage
  if (!session?.user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-lg text-gray-600">
            Here&apos;s your financial overview
          </p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <ServerAccountsWidget />
          <ExpensesIncomeWidget />
          <GroceryWidget />
          <AnalyticsWidget />
          <PlannedPurchasesWidget />
        </div>

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you might want to perform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                variant="outline"
              >
                <Link href="/accounts/new">Add Account</Link>
              </Button>
              <Button
                disabled
                variant="outline"
              >
                Add Transaction
              </Button>
              <Button
                disabled
                variant="outline"
              >
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

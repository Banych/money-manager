import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getAuthSession } from '@/lib/auth';
import { PieChart, Receipt, TrendingUp, Wallet } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getAuthSession();

  // Redirect authenticated users to dashboard
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Money Manager App
          </h1>
          <p className="mb-8 text-lg text-gray-600">
            Take control of your finances with our comprehensive money
            management tools
          </p>
          <Button
            asChild
            size="lg"
            className="mb-8"
          >
            <Link href="/auth/signin">Get Started - Sign In</Link>
          </Button>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                Financial Accounts
              </CardTitle>
              <CardDescription>
                Manage your wallets, bank accounts, and cards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                className="w-full"
                variant="outline"
              >
                <Link href="/auth/signin">Sign In to Access</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-60 transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-green-600" />
                Expenses & Income
              </CardTitle>
              <CardDescription>Track your spending and income</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                disabled
                className="w-full"
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-60 transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Analytics
              </CardTitle>
              <CardDescription>
                View your spending trends and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                disabled
                className="w-full"
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-60 transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-orange-600" />
                Planned Purchases
              </CardTitle>
              <CardDescription>
                Manage your wishlist and planned expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                disabled
                className="w-full"
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

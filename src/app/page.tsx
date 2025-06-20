import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PieChart, Receipt, TrendingUp, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Money Manager App
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Take control of your finances with our comprehensive money
            management tools
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
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
              >
                <Link href="/accounts">Manage Accounts</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow opacity-60">
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

          <Card className="hover:shadow-lg transition-shadow opacity-60">
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

          <Card className="hover:shadow-lg transition-shadow opacity-60">
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

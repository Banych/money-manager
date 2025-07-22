import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart3, Calendar, TrendingUp } from 'lucide-react';

export default function AnalyticsWidget() {
  // Mock data - replace with real analytics when implemented
  const monthlyGrowth = 12.5;
  const topCategories = [
    { name: 'Groceries', amount: 450, percentage: 32 },
    { name: 'Transport', amount: 280, percentage: 20 },
    { name: 'Entertainment', amount: 180, percentage: 13 },
  ];
  const savingsRate = 25;

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          Analytics
          <Badge
            variant="secondary"
            className="justify-center"
          >
            Coming Soon
          </Badge>
        </CardTitle>
        <CardDescription>Your spending insights and trends</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-purple-50 p-3 text-center">
            <p className="text-sm text-gray-500">Monthly Growth</p>
            <p className="text-lg font-semibold text-purple-600">
              +{monthlyGrowth}%
            </p>
          </div>
          <div className="rounded-lg bg-green-50 p-3 text-center">
            <p className="text-sm text-gray-500">Savings Rate</p>
            <p className="text-lg font-semibold text-green-600">
              {savingsRate}%
            </p>
          </div>
        </div>

        {/* Top Categories */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            Top Spending Categories
          </h4>
          <div className="space-y-2">
            {topCategories.map((category, index) => (
              <div
                key={index}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                  <span className="text-sm">{category.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">
                    €{category.amount}
                  </span>
                  <span className="ml-1 text-xs text-gray-500">
                    ({category.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            disabled
            size="sm"
            className="flex-1"
          >
            <BarChart3 className="mr-1 h-4 w-4" />
            View Reports
          </Button>
          <Button
            disabled
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Calendar className="mr-1 h-4 w-4" />
            Set Budget
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

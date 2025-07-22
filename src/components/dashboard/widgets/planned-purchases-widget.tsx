import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PieChart, Plus, Target } from 'lucide-react';

export default function PlannedPurchasesWidget() {
  // Mock data - replace with real planned purchases when implemented
  const totalPlanned = 2500;
  const totalSaved = 1200;
  const plannedItems = [
    { id: 1, name: 'New Laptop', target: 1500, saved: 800, priority: 'high' },
    {
      id: 2,
      name: 'Vacation Fund',
      target: 800,
      saved: 400,
      priority: 'medium',
    },
    { id: 3, name: 'Emergency Fund', target: 200, saved: 0, priority: 'low' },
  ];
  const progressPercentage = Math.round((totalSaved / totalPlanned) * 100);

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-orange-600" />
          Planned Purchases
          <Badge
            variant="secondary"
            className="justify-center"
          >
            Coming Soon
          </Badge>
        </CardTitle>
        <CardDescription>Your savings goals and wishlists</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="rounded-lg bg-orange-50 p-3 text-center">
          <p className="text-sm text-gray-500">Total Progress</p>
          <p className="text-2xl font-bold text-orange-600">
            {progressPercentage}%
          </p>
          <p className="text-xs text-gray-500">
            €{totalSaved.toLocaleString()} of €{totalPlanned.toLocaleString()}
          </p>
        </div>

        {/* Planned Items */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            Current Goals
          </h4>
          <div className="space-y-3">
            {plannedItems.map((item) => {
              const itemProgress = Math.round((item.saved / item.target) * 100);
              const priorityColor = {
                high: 'bg-red-500',
                medium: 'bg-yellow-500',
                low: 'bg-green-500',
              }[item.priority];

              return (
                <div
                  key={item.id}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 ${priorityColor} rounded-full`}
                      ></div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {itemProgress}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-200">
                    <div
                      className="h-1.5 rounded-full bg-orange-600 transition-all"
                      style={{ width: `${itemProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>€{item.saved}</span>
                    <span>€{item.target}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            disabled
            size="sm"
            className="flex-1"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Goal
          </Button>
          <Button
            disabled
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Target className="mr-1 h-4 w-4" />
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

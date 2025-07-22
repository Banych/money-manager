import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check, Clock, Plus, ShoppingCart } from 'lucide-react';

export default function GroceryWidget() {
  // Mock data - replace with real grocery/planned purchases when implemented
  const totalItems = 12;
  const completedItems = 4;
  const totalEstimatedCost = 85.5;

  const groceryItems = [
    {
      id: 1,
      name: 'Milk',
      price: 3.2,
      completed: false,
      urgent: true,
      recipe: 'Pancakes',
    },
    {
      id: 2,
      name: 'Bread',
      price: 2.5,
      completed: true,
      urgent: false,
      recipe: null,
    },
    {
      id: 3,
      name: 'Tomatoes',
      price: 4.8,
      completed: false,
      urgent: false,
      recipe: 'Pasta Sauce',
    },
    {
      id: 4,
      name: 'Chicken',
      price: 12.0,
      completed: false,
      urgent: true,
      recipe: 'Sunday Dinner',
    },
  ];

  const urgentItems = groceryItems.filter(
    (item) => item.urgent && !item.completed
  ).length;

  const progressPercentage = Math.round((completedItems / totalItems) * 100);

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          Grocery List
          <Badge
            variant="secondary"
            className="justify-center"
          >
            Coming Soon
          </Badge>
        </CardTitle>
        <CardDescription>
          Your planned purchases and shopping list
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-sm text-gray-500">Total Items</p>
            <p className="text-lg font-semibold text-blue-600">{totalItems}</p>
          </div>
          <div className="rounded-lg bg-green-50 p-3">
            <p className="text-sm text-gray-500">Progress</p>
            <p className="text-lg font-semibold text-green-600">
              {progressPercentage}%
            </p>
          </div>
          <div className="rounded-lg bg-orange-50 p-3">
            <p className="text-sm text-gray-500">Est. Cost</p>
            <p className="text-lg font-semibold text-orange-600">
              €{totalEstimatedCost}
            </p>
          </div>
        </div>

        {/* Urgent Items Alert */}
        {urgentItems > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2">
            <Clock className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">
              {urgentItems} urgent {urgentItems === 1 ? 'item' : 'items'} needed
            </span>
          </div>
        )}

        {/* Recent Items */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            Shopping List Preview
          </h4>
          <div className="max-h-32 space-y-2 overflow-y-auto">
            {groceryItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded border-2 ${
                      item.completed
                        ? 'border-green-600 bg-green-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {item.completed && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`${item.completed ? 'text-gray-500 line-through' : ''}`}
                    >
                      {item.name}
                    </span>
                    {item.recipe && (
                      <span className="text-xs text-blue-600">
                        for {item.recipe}
                      </span>
                    )}
                  </div>
                  {item.urgent && !item.completed && (
                    <Badge
                      variant="destructive"
                      className="px-1 py-0 text-xs"
                    >
                      Urgent
                    </Badge>
                  )}
                </div>
                <span
                  className={`font-medium ${item.completed ? 'text-gray-500' : 'text-gray-900'}`}
                >
                  €{item.price}
                </span>
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
            <Plus className="mr-1 h-4 w-4" />
            Add Item
          </Button>
          <Button
            disabled
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <ShoppingCart className="mr-1 h-4 w-4" />
            View List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

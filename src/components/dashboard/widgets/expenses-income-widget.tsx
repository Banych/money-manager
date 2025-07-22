import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Receipt } from 'lucide-react';

export default function ExpensesIncomeWidget() {
  // Mock data - replace with real data when transactions are implemented
  const monthlyIncome = 3500;
  const monthlyExpenses = 2800;
  const netIncome = monthlyIncome - monthlyExpenses;
  const recentTransactions = [
    { id: 1, description: 'Grocery Store', amount: -120, type: 'expense' },
    { id: 2, description: 'Salary', amount: 3500, type: 'income' },
    { id: 3, description: 'Coffee Shop', amount: -8.5, type: 'expense' },
  ];

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-green-600" />
          Expenses & Income
          <Badge
            variant="secondary"
            className="justify-center"
          >
            Coming Soon
          </Badge>
        </CardTitle>
        <CardDescription>This month&apos;s financial activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Income</p>
            <p className="text-lg font-semibold text-green-600">
              +€{monthlyIncome.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Expenses</p>
            <p className="text-lg font-semibold text-red-600">
              -€{monthlyExpenses.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Net</p>
            <p
              className={`text-lg font-semibold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {netIncome >= 0 ? '+' : ''}€{netIncome.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            Recent Transactions
          </h4>
          <div className="space-y-2">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate">{transaction.description}</span>
                <span
                  className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                >
                  {transaction.amount >= 0 ? '+' : ''}€
                  {Math.abs(transaction.amount)}
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
            Add Transaction
          </Button>
          <Button
            disabled
            variant="outline"
            size="sm"
            className="flex-1"
          >
            View All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

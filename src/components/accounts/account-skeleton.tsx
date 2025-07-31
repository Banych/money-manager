import { Card, CardContent, CardHeader } from '@/components/ui/card';

const AccountSkeleton = () => {
  return (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-24 rounded bg-gray-200"></div>
          <div className="h-5 w-12 rounded-full bg-gray-200"></div>
        </div>
        <div className="h-4 w-4 rounded bg-gray-200"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance and trend */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="mb-2 h-8 w-32 rounded bg-gray-200"></div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-16 rounded bg-gray-200"></div>
              <div className="h-4 w-12 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>

        {/* Activity info */}
        <div className="space-y-1">
          <div className="h-3 w-20 rounded bg-gray-200"></div>
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 rounded bg-gray-200"></div>
            <div className="h-3 w-16 rounded bg-gray-200"></div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="h-1 w-full rounded bg-gray-200"></div>
          <div className="mx-auto h-3 w-20 rounded bg-gray-200"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSkeleton;

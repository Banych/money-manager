import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const AccountSkeleton = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5.5 w-18" />
        </div>
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance and trend */}
        <div className="flex items-center justify-between">
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-12 rounded" />
            </div>
          </div>
        </div>

        {/* Activity info */}
        <div className="space-y-1">
          <Skeleton className="h-3 w-20 rounded" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSkeleton;

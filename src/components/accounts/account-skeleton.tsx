import { Card, CardContent, CardHeader } from '@/components/ui/card';

const AccountSkeleton = () => {
  return (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 rounded bg-gray-200"></div>
        <div className="h-4 w-4 rounded bg-gray-200"></div>
      </CardHeader>
      <CardContent>
        <div className="mb-2 h-6 w-20 rounded bg-gray-200"></div>
        <div className="h-4 w-16 rounded bg-gray-200"></div>
      </CardContent>
    </Card>
  );
};

export default AccountSkeleton;

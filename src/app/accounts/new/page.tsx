import AddAccountFormWrapper from '@/components/accounts/add-account-form-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Add Account - Money Manager',
  description: 'Add a new financial account',
};

export const dynamic = 'force-static';

export default function NewAccountPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-4 sm:max-w-md sm:py-6 lg:max-w-2xl lg:px-8">
      {/* Header with back button */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs sm:h-9 sm:text-sm"
          asChild
        >
          <Link href="/accounts">
            <ArrowLeft className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Back to Accounts</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </Button>
      </div>

      {/* Main content */}
      <Card className="shadow-lg">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl">
            Add Financial Account
          </CardTitle>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Create a new account to track your finances.
          </p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <AddAccountFormWrapper />
        </CardContent>
      </Card>
    </div>
  );
}

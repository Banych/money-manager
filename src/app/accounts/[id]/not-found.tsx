import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

export default function AccountNotFound() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        <FileQuestion className="mx-auto mb-6 h-24 w-24 text-gray-400" />
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          Account Not Found
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          The account you&apos;re looking for doesn&apos;t exist or you
          don&apos;t have permission to view it.
        </p>
        <div className="space-x-4">
          <Link href="/accounts">
            <Button>Back to Accounts</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

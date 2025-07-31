'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function AddAccountButton() {
  return (
    <Button
      asChild
      size={null}
      variant="ghost"
      className="h-auto p-0"
    >
      <Link href="/accounts/new">
        <Card className="flex min-h-[140px] grow items-end justify-start rounded-xl bg-gray-50 px-4 transition-shadow hover:shadow-md sm:min-h-[158px] sm:px-6">
          <CardContent className="flex w-full grow items-center justify-center gap-2 p-4 text-gray-500 sm:p-6">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Add Account</span>
          </CardContent>
        </Card>
      </Link>
    </Button>
  );
}

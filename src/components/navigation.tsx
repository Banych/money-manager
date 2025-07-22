'use client';

import ProfileDropdown from '@/components/profile/profile-dropdown';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Don't show navigation on sign-in page
  if (pathname === '/auth/signin') {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto max-w-4xl px-4 py-3">
        <div className="flex items-center justify-between">
          <Link
            href={session?.user ? '/dashboard' : '/'}
            className="text-xl font-bold text-gray-900"
          >
            Money Manager
          </Link>

          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : session?.user ? (
              <ProfileDropdown
                user={{
                  image: session.user.image || '',
                  name: session.user.name || '',
                  email: session.user.email || '',
                }}
              />
            ) : (
              <Button asChild>
                <Link href="/auth/signin?callbackUrl=%2F">
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

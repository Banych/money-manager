'use client';

import ProfileDropdown from '@/components/profile/profile-dropdown';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CreditCard, LayoutDashboard, Receipt, User } from 'lucide-react';
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
          <div className="flex items-center space-x-6">
            <Link
              href={session?.user ? '/dashboard' : '/'}
              className="text-xl font-bold text-gray-900"
            >
              Money Manager
            </Link>

            {/* Main Navigation Links */}
            {session?.user && (
              <nav className="hidden items-center space-x-4 md:flex">
                <Link
                  href="/dashboard"
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    pathname === '/dashboard'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <LayoutDashboard className="mr-1 inline h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/accounts"
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    pathname.startsWith('/accounts')
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <CreditCard className="mr-1 inline h-4 w-4" />
                  Accounts
                </Link>
                <Link
                  href="/transactions"
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    pathname.startsWith('/transactions')
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Receipt className="mr-1 inline h-4 w-4" />
                  Transactions
                </Link>
              </nav>
            )}
          </div>

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

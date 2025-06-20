'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, LogOut, User, Wallet } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Don't show navigation on sign-in page
  if (pathname === '/auth/signin') {
    return null;
  }

  if (pathname === '/') {
    return (
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900"
            >
              Money Manager
            </Link>

            <div className="flex items-center space-x-4">
              {status === 'loading' ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : session?.user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Hello, {session.user.name || session.user.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button asChild>
                  <Link href="/auth/signin?callbackUrl=%2F">
                    <User className="h-4 w-4 mr-2" />
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

  return (
    <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={pathname === '/' ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            {session?.user && (
              <Button
                variant={pathname === '/accounts' ? 'default' : 'ghost'}
                size="sm"
                asChild
              >
                <Link href="/accounts">
                  <Wallet className="h-4 w-4 mr-2" />
                  Accounts
                </Link>
              </Button>
            )}

            {status === 'loading' ? (
              <div className="text-xs text-gray-500">Loading...</div>
            ) : session?.user ? (
              <div className="flex items-center space-x-2 ml-4">
                <span className="text-xs text-gray-700">
                  {session.user.name || session.user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                asChild
              >
                <Link
                  href={`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`}
                >
                  <User className="h-4 w-4 mr-2" />
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

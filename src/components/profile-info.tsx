'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function ProfileInfo() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome!</h2>
          <p className="text-gray-600 mb-6">
            Sign in to access your money manager dashboard
          </p>
          <Button
            onClick={() => signIn('google')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md border">
      <div className="flex items-start space-x-4">
        {session?.user?.image && (
          <div className="flex-shrink-0">
            <Image
              src={session.user.image}
              alt={session.user.name || 'User avatar'}
              width={64}
              height={64}
              className="rounded-full"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome back
                {session?.user?.name ? `, ${session.user.name}` : ''}!
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                You are successfully signed in
              </p>
            </div>
            <Button
              onClick={() => signOut()}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Profile Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-sm font-medium text-gray-500">Name</label>
            <p className="text-gray-900 mt-1">
              {session?.user?.name || 'Not provided'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-gray-900 mt-1">
              {session?.user?.email || 'Not provided'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-sm font-medium text-gray-500">User ID</label>
            <p className="text-gray-900 mt-1 font-mono text-xs">
              {session?.user?.id || 'Not available'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-sm font-medium text-gray-500">Role</label>
            <p className="text-gray-900 mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {session?.user?.role || 'USER'}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Authentication Status
        </h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Successfully authenticated
              </p>
              <p className="text-sm text-green-700">
                Your Google sign-in is working correctly!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

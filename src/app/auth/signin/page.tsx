'use client';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-xl mb-4">Sign in</h1>
      <Button onClick={() => signIn('google')}>Sign in with Google</Button>
    </div>
  );
}

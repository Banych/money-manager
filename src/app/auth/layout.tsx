import type { Metadata } from 'next';

// Force static generation for auth layout
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Sign In - Money Manager',
  description: 'Sign in to your Money Manager account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

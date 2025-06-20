import type { Metadata } from 'next';

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

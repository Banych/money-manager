import Navigation from '@/components/navigation';
import Providers from '@/components/providers/';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Money Manager',
  description: 'A simple money management app',
  keywords: 'money, management, finance, budget, expenses',
  authors: [
    {
      name: 'Vladislav Banykin',
      url: 'https://github.com/Banych',
    },
  ],
  creator: 'Vladislav Banykin',
  openGraph: {
    title: 'Money Manager',
    description: 'A simple money management app',
    url: 'https://money-manager.example.com',
    siteName: 'Money Manager',
    images: [
      {
        url: 'https://money-manager.example.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Money Manager Open Graph Image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Money Manager',
    description: 'A simple money management app',
    creator: '@Banych',
    images: [
      {
        url: 'https://money-manager.example.com/twitter-image.png',
        width: 1200,
        height: 630,
        alt: 'Money Manager Twitter Image',
      },
    ],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navigation />
          {children}
        </Providers>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}

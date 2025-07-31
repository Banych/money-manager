import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { getServerSession, NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from './db';

export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    signIn: async ({ account, profile }) => {
      if (
        profile &&
        account?.provider === 'google' &&
        'email_verified' in profile
      ) {
        return !!profile.email_verified;
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // If user just signed in, redirect to dashboard
      if (url.endsWith('/signin')) {
        return `${baseUrl}/dashboard`;
      }
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
    async jwt({ token, user, account }) {
      // On initial sign in, user object is available
      if (account && user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.role = user.role || 'USER';
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token?.id) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
        session.user.role =
          (token.role as 'USER' | 'OWNER' | 'PARTNER') || 'USER';
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

export const getAuthSession = () => getServerSession(authConfig);

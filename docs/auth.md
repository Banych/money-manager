# Authentication & Authorization

## Overview

- Uses NextAuth.js with Prisma Adapter for authentication.
- Supports Google OAuth (or Credentials provider).
- JWT strategy with custom callbacks to include user id, role, name, email, image in session.
- Middleware restricts access to authenticated routes.
- Roles: OWNER, PARTNER, USER.

## NextAuth.js Configuration

```typescript
// src/lib/auth.ts
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';

export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};
```

### Key Features Implemented:

1. **Email Verification Requirement**: The `signIn` callback ensures that only users with verified Google emails can sign in.
2. **JWT Strategy**: Uses JWT tokens for session management (implicit default).
3. **Custom Session Data**: Includes user ID, role, name, email, and image in the session object.
4. **Prisma Adapter**: Integrates with the database for user and session management.

## TypeScript Type Augmentation

```typescript
// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: 'OWNER' | 'PARTNER' | 'USER';
    };
  }

  interface User extends DefaultUser {
    id: string;
    role: 'OWNER' | 'PARTNER' | 'USER';
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: 'OWNER' | 'PARTNER' | 'USER';
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}
```

## Middleware Protection

The middleware protects all application routes except for authentication, API routes, and static assets:

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/auth/signin',
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
```

This configuration ensures that:
- All pages require authentication by default
- Authentication routes (`/auth/*`) are accessible to unauthenticated users
- API routes are handled separately (can implement their own auth checks)
- Static assets and metadata files are publicly accessible

## Accessing Session

- **Client:** `useSession()` from `next-auth/react`
- **Server:** `getServerSession(authOptions)`

## Best Practices

- Store lightweight, rarely-changing user info in session (id, name, email, image, role).
- Fetch dynamic or sensitive data (e.g., account balances) via backend endpoints as needed.
- Use TypeScript augmentation for type safety.

See [docs/data-models.md](./data-models.md) for user/role schema.

## Database Schema Notes

In the Prisma schema, the `role` field is implemented as a `String` type with a default value of "USER":

```prisma
model User {
  id                String             @id @default(cuid())
  name              String?
  email             String             @unique
  emailVerified     DateTime?
  image             String?
  role              String             @default("USER")  // String type, not enum
  // ... other fields
}
```

While TypeScript types enforce the role as `"OWNER" | "PARTNER" | "USER"`, the database stores it as a string. This provides flexibility while maintaining type safety in the application layer.

## Why TypeScript Module Augmentation is Needed

NextAuth's default types do **not** include custom fields (like `role`, `image`, etc.) in `Session`, `User`, or `JWT`. To ensure type-safety and avoid TypeScript errors, you must **extend (augment) the original NextAuth interfaces** using module augmentation. This is required because the original classes/interfaces do not have the fields your app needs for authorization and user display.

- Without augmentation, TypeScript will not recognize `session.user.role`, `session.user.id`, etc.
- With augmentation, you get autocompletion and type-checking for all custom fields.

See the example in this file and ensure your `types/next-auth.d.ts` is loaded by TypeScript.
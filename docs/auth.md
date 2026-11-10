# Authentication & Authorization

## Overview

- Uses NextAuth.js with Prisma Adapter for authentication.
- Supports Google OAuth (or Credentials provider).
- JWT strategy with custom callbacks to include user id, role, name, email, image in session.
- Each API route and server page checks the session itself; the middleware
  file is not active (see "Route Protection" below).
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

## Route Protection

Protection is done per route, with `getAuthSession()` from `src/lib/auth.ts`:

- Every API route handler under `src/app/api/` returns
  `401 {"error":"Unauthorized"}` when there is no session.
- Server pages either `redirect()` (for example `/accounts` to `/auth/signin`,
  `/dashboard` to `/`) or call `forbidden()` (`/transactions`, which currently
  answers 500 because `experimental.authInterrupts` is not enabled).

`middleware.ts` at the repository root (`withAuth`, matchers
`/accounts/:path*` and `/api/accounts/:path*`) is **not compiled**: the app
lives under `src/app`, and Next only picks up middleware placed beside the
`app` directory, i.e. `src/middleware.ts`. The build's
`.next/server/middleware-manifest.json` is empty, and no `Middleware` line
appears in the route table. Verified 2026-11-10 on Next 15.3.3 and 15.5.29;
see `docs/progress/2026-11-10-session.md`.

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

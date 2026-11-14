# Authentication & Authorization

## Overview

- Uses NextAuth.js with Prisma Adapter for authentication.
- Supports Google OAuth (or Credentials provider).
- JWT strategy with custom callbacks to include user id, role, name, email, image in session.
- Each API route and server page checks the session itself; there is no
  middleware, by decision (see "Route Protection" below).
- Roles: OWNER, PARTNER, USER.

## NextAuth.js Configuration

`NEXTAUTH_URL` must stay unset on Vercel (it is, checked 2026-11-14). From
next-auth 4.24.15 it takes precedence over the host Vercel forwards, so a
value copied from a local `.env` would build Google's `redirect_uri` and the
`redirect` callback's `baseUrl` on that host.

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

- Every API route handler under `src/app/api/` (except next-auth's own
  handler) returns `401 {"error":"Unauthorized"}` when there is no session.
- Server pages, for a signed-out visitor:
  - `/accounts`, `/accounts/[id]/edit`, `/transactions`, `/transactions/[id]`,
    `/transactions/[id]/edit` and the two edit modals
    (`@editAccountModal`, `@editTransactionModal`) redirect to `/auth/signin`.
  - `/dashboard` redirects to `/`.
  - `/accounts/[id]` answers 404 (`notFound()`).
  - `/accounts/new`, `/transactions/new` and their `(.)` modals have no
    session check; their forms post to APIs that answer 401.
- The redirects pass no `callbackUrl`, so signing in lands on the default page.

There is no middleware, by decision: see
`docs/superpowers/specs/2026-11-10-auth-guards-design.md`. The old root
`middleware.ts` (`withAuth`, matchers `/accounts/:path*` and
`/api/accounts/:path*`) was never compiled, because Next only picks up
middleware placed beside the `app` directory, and it was deleted. Re-adding
one has these constraints:

- It must live in `src/middleware.ts`; a root `middleware.ts` is never
  compiled when the app is under `src/app`.
- It needs next-auth 4.24.15 or later, which the app is on: on earlier
  versions, middleware would make next-auth's `getToken()` advisory about
  malformed Bearer headers reachable.
- A `withAuth` matcher covering `/api/*` would turn those routes' 401s into
  307 redirects to the sign-in page.

See `docs/progress/2026-11-10-auth-guards-session.md` for the checks.

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

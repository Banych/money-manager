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
import { PrismaAdapter } from '@auth/prisma-adapter';
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
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image;
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
};
```
      session.user.role = token.role;
    }
    return session;
  }
},
session: { strategy: "jwt" },
// ...existing code...
```

## TypeScript Type Augmentation

```typescript
// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "OWNER" | "PARTNER" | "USER";
    };
  }
  interface User {
    id: string;
    role: "OWNER" | "PARTNER" | "USER";
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "OWNER" | "PARTNER" | "USER";
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}
```

## Middleware Example

```typescript
// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

export const config = {
  matcher: ["/dashboard", "/accounts", "/expenses"],
};
```

## Accessing Session

- **Client:** `useSession()` from `next-auth/react`
- **Server:** `getServerSession(authOptions)`

## Best Practices

- Store lightweight, rarely-changing user info in session (id, name, email, image, role).
- Fetch dynamic or sensitive data (e.g., account balances) via backend endpoints as needed.
- Use TypeScript augmentation for type safety.

See [docs/data-models.md](./data-models.md) for user/role schema.

## Why TypeScript Module Augmentation is Needed

NextAuth's default types do **not** include custom fields (like `role`, `image`, etc.) in `Session`, `User`, or `JWT`. To ensure type-safety and avoid TypeScript errors, you must **extend (augment) the original NextAuth interfaces** using module augmentation. This is required because the original classes/interfaces do not have the fields your app needs for authorization and user display.

- Without augmentation, TypeScript will not recognize `session.user.role`, `session.user.id`, etc.
- With augmentation, you get autocompletion and type-checking for all custom fields.

See the example in this file and ensure your `types/next-auth.d.ts` is loaded by TypeScript.
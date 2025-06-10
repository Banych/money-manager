import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: 'OWNER' | 'PARTNER' | 'USER';
    };
  }

  interface User {
    id: string;
    role: 'OWNER' | 'PARTNER' | 'USER';
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'OWNER' | 'PARTNER' | 'USER';
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

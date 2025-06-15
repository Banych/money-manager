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

import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/auth/signin',
  },
});

export const config = {
  matcher: [
    // Protected routes that require authentication
    '/accounts/:path*',
    '/api/accounts/:path*',
    // Add other protected routes here as needed
  ],
};

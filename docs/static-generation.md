# Static Generation Strategy

## Overview

This document outlines the static generation strategy for the Money Manager application using Next.js 15.3.3. Static generation improves performance by pre-rendering pages at build time and serving them from CDN.

## Current Static Pages

The following pages are currently configured for static generation:

### ✅ Implemented

- **`/`** (Homepage) - Landing page with client-side auth redirect
- **`/accounts/new`** - Account creation form with progressive enhancement
- **`/@newAccountModal/(.)accounts/new`** - Intercepted modal route

## Recommended Static Pages

### 🎯 High Priority - Should Implement Now

#### 1. `/auth/signin` - Authentication Page

```tsx
export const dynamic = 'force-static';
```

**Rationale**:

- Pure client-side authentication form
- No server-side data dependencies
- Benefits from CDN caching for faster load times
- Already uses `'use client'` directive

**Implementation Notes**:

- Already client-side rendered
- No changes needed beyond adding static export
- Will improve initial load time for unauthenticated users

#### 2. `/auth/layout.tsx` - Auth Layout

```tsx
export const dynamic = 'force-static';
```

**Rationale**:

- Simple layout with static metadata
- No dynamic content or server dependencies

### 📋 Medium Priority - Future Implementation

#### 3. Error Pages (when created)

- **`/not-found`** - Custom 404 page
- **`/error`** - Global error boundary page

```tsx
export const dynamic = 'force-static';
```

#### 4. Marketing/Info Pages (when created)

- **`/about`** - About page
- **`/privacy`** - Privacy policy
- **`/terms`** - Terms of service
- **`/help`** - Help documentation

```tsx
export const dynamic = 'force-static';
export const revalidate = 86400; // Revalidate daily for content updates
```

### ❌ Cannot Be Static - Server-Side Data Required

#### 1. `/dashboard` - User Dashboard

**Reason**: Requires authenticated user session and personalized data

- Uses `getAuthSession()` server-side function
- Renders user-specific financial data
- Dynamic based on user accounts and transactions

#### 2. `/accounts` - Accounts List

**Reason**: Requires authenticated user session and user-specific account data

- Server-side authentication check with `getAuthSession()`
- Renders user's financial accounts
- Dynamic content based on user's data

#### 3. API Routes

**Reason**: All API routes are inherently dynamic

- `/api/auth/[...nextauth]` - Authentication endpoints
- `/api/accounts` - Account CRUD operations
- `/api/accounts/[id]` - Individual account operations

## Technical Implementation

### Next.js 15.3.3 Compliance ✅

Our static generation implementation is fully compliant with Next.js 15.3.3:

```tsx
// ✅ CORRECT - Current implementation
export const dynamic = 'force-static';

// ✅ CORRECT - Optional ISR
export const revalidate = 3600; // Revalidate hourly

// ✅ CORRECT - Control dynamic params
export const dynamicParams = true; // Allow new dynamic segments
```

**Verification**: According to [Next.js 15 Route Segment Config docs](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config), the `dynamic` export supports:

- `'auto'` (default)
- `'force-dynamic'`
- `'error'`
- `'force-static'` ✅ (our choice)

### Alternative Approaches ❌

These patterns are NOT needed in Next.js 15:

```tsx
// ❌ OUTDATED - Not needed in App Router
export async function getStaticProps() { ... }

// ❌ OUTDATED - Not needed in App Router
export async function getServerSideProps() { ... }

// ❌ INCORRECT - Wrong syntax
export const generateStaticParams = true; // This is for dynamic routes only
```

### Progressive Enhancement Pattern

For auth-protected pages that can be static:

```tsx
// Static page with client-side auth protection
export const dynamic = 'force-static';

function AuthRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  return <LoadingSpinner />;
}
```

## Build Output Analysis

### Current Build Status

- ✅ Static (○): `/`, `/accounts/new`, `/@newAccountModal/(.)accounts/new`
- 🔄 Server-side (λ): `/dashboard`, `/accounts`
- ⚡ Dynamic (ƒ): Routes that should potentially be static

### Target Build Status

After implementing recommendations:

- ✅ Static (○): `/`, `/auth/signin`, `/accounts/new`, auth layouts, error pages
- 🔄 Server-side (λ): `/dashboard`, `/accounts` (correct - require auth + data)
- ⚡ Dynamic (ƒ): Only API routes and truly dynamic content

## Performance Benefits

### Expected Improvements

1. **Faster Initial Load**: Static pages served from CDN
2. **Better SEO**: Pre-rendered HTML for search engines
3. **Reduced Server Load**: Less server-side rendering
4. **Improved Caching**: Better browser and CDN cache efficiency

### Metrics to Monitor

- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Build time and bundle size

## Implementation Checklist

### Phase 1: Quick Wins

- [ ] Add `export const dynamic = 'force-static'` to `/auth/signin/page.tsx`
- [ ] Add `export const dynamic = 'force-static'` to `/auth/layout.tsx`
- [ ] Test auth flow with static signin page
- [ ] Verify build output shows routes as static (○)

### Phase 2: Future Enhancements

- [ ] Create and implement error pages with static generation
- [ ] Add marketing pages with static generation and ISR
- [ ] Implement proper loading states for static pages with auth
- [ ] Add performance monitoring for static vs dynamic pages

## Best Practices

### When to Use Static Generation

1. ✅ Content doesn't depend on user-specific data
2. ✅ Page can be pre-rendered at build time
3. ✅ Auth can be handled client-side
4. ✅ Data doesn't change frequently (or can use ISR)

### When NOT to Use Static Generation

1. ❌ Requires server-side authentication
2. ❌ Shows user-specific data immediately
3. ❌ Depends on request-time data (headers, cookies)
4. ❌ Needs real-time updates

### Progressive Enhancement Approach

1. Start with static page
2. Add client-side loading state
3. Implement auth check and redirect
4. Provide fallback UI during loading

## Monitoring and Maintenance

### Build Analysis

Regularly check build output for:

- Unexpected dynamic routes
- Bundle size changes
- Build time performance

### Performance Monitoring

Track Core Web Vitals for:

- Static vs dynamic page performance
- Auth flow performance impact
- Overall user experience metrics

### Content Updates

For static pages with content:

- Use ISR for periodic updates
- Implement cache invalidation strategies
- Monitor content freshness requirements

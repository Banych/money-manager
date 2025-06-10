# Development Guide

## Getting Started

Based on the chat discussion, here's the step-by-step development approach:

## Phase 1: Setup & Core Features

### Step 1: Database & Authentication Setup

1. **Setup Prisma with Supabase**
   ```powershell
   npm install prisma @prisma/client
   npx prisma init
   ```

2. **Configure NextAuth.js**
   ```powershell
   npm install next-auth @auth/prisma-adapter
   ```

3. **Environment Variables**
   ```env
   DATABASE_URL="postgresql://..."
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   NEXTAUTH_SECRET="..."
   NEXTAUTH_URL="http://localhost:3000"
   ```

### Step 2: Core Features Development Order

1. **Authentication Pages**
   - `/auth/signin` - Google OAuth login
   - Dashboard layout with navigation

2. **Account Management**
   - Create/edit accounts (wallets, cards, etc.)
   - View account balances
   - Account selection UI

3. **Expense Tracking**
   - Add expense form
   - Link to accounts
   - Manual item entry
   - Expense list/history

4. **Basic Analytics**
   - Monthly spending summary
   - Spending by category
   - Account balance overview

5. **Planned Purchases**
   - Wishlist functionality
   - Price suggestions from history
   - Mark items as purchased

## Development Principles

- **Mobile First:** Design for mobile, enhance for desktop
- **Simple UI:** Use shadcn/ui components consistently
- **Type Safety:** Use TypeScript and Zod for validation
- **Progressive Enhancement:** Core features first, AI features later

## Testing Strategy

- Start with manual testing
- Add unit tests for critical business logic
- E2E tests for core user flows
- Performance testing for database queries

## Deployment

- Use Vercel for easy Next.js deployment
- Supabase for production database
- Environment variables for API keys
- Preview deployments for feature branches

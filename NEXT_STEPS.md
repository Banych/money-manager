# Next Steps Implementation Plan

## Phase 1: Core Transaction System (Priority: HIGH)

### Step 1: Update Database Schema

1. **Add Transaction Model to Prisma Schema**

   ```bash
   # Add this to prisma/schema.prisma
   ```

2. **Run Migration**
   ```bash
   yarn prisma migrate dev --name add-transactions
   yarn prisma generate
   ```

### Step 2: Create API Endpoints

3. **Transaction API Routes**
   - `src/app/api/transactions/route.ts` - Create/list transactions
   - `src/app/api/transactions/[id]/route.ts` - Update/delete transaction
   - `src/app/api/accounts/[id]/transactions/route.ts` - Account-specific transactions
   - `src/app/api/accounts/[id]/stats/route.ts` - Account statistics

### Step 3: Data Layer & Hooks

4. **Database Queries**

   - `src/lib/queries/transactions.ts`
   - `src/lib/queries/account-stats.ts`

5. **React Hooks**
   - `src/hooks/useTransactions.ts`
   - `src/hooks/useAccountStats.ts`
   - `src/hooks/useCreateTransaction.ts`

### Step 4: Update Components

6. **Replace Mock Data**

   - Update `AccountStats` component to use real data
   - Update `RecentTransactions` component
   - Remove mock data generators

7. **Transaction Forms**
   - `src/components/transactions/transaction-form.tsx`
   - Add/Edit transaction modals

## Phase 2: Enhanced Features (Priority: MEDIUM)

### Step 5: Advanced UI

- Transaction filtering and search
- Bulk operations
- Enhanced analytics dashboard

### Step 6: Categories & Organization

- Transaction categories system
- Custom category creation
- Category-based analytics

## Current Focus: Transaction System

**Why This is Important:**

- Without transactions, the app is just account storage
- This unlocks all other features (analytics, budgeting, etc.)
- Foundation for receipt OCR and other smart features

**Estimated Timeline:**

- Week 1: Database + API implementation
- Week 2: Frontend integration + forms

**Success Criteria:**

- Can add income/expense to accounts
- Account balances update correctly
- Transaction history displays real data
- Basic statistics work with real data

## Ready to Start?

1. Update Prisma schema with Transaction model
2. Run migration: `yarn prisma migrate dev --name add-transactions`
3. Create first API endpoint: `/api/transactions`
4. Test with account details page

---

_See docs/account-details-tasks.md for detailed implementation tasks_

# Account Details Implementation Tasks

## Overview

This document tracks the implementation tasks for converting the account details page from mock data to production-ready functionality with real database integration.

## Current Implementation Status ✅

### Completed Components

- ✅ **AccountOverview**: Rich account header with balance, status, and metadata
- ✅ **AccountStats**: Financial metrics cards with income/expense/net change
- ✅ **RecentTransactions**: Transaction list with categories and formatting
- ✅ **AccountActions**: Quick action buttons for account management
- ✅ **AccountCard**: Enhanced account cards with activity status and trends
- ✅ **Mock Data System**: Realistic transaction and statistics generation
- ✅ **Routing**: Dynamic `/accounts/[id]` pages with proper auth
- ✅ **Navigation**: Clickable cards and back navigation

## Production Tasks 🚧

### Phase 1: Database Schema & Models

#### 1.1 Create Transaction Models

**Priority: HIGH**

```prisma
// Add to schema.prisma
model Transaction {
  id            String               @id @default(cuid())
  amount        Float
  description   String
  date          DateTime             @default(now())
  type          TransactionType      // 'INCOME' | 'EXPENSE'
  category      String?
  accountId     String
  account       FinancialAccount     @relation(fields: [accountId], references: [id])
  userId        String
  user          User                 @relation(fields: [userId], references: [id])
  receiptUrl    String?              // For future receipt storage
  createdAt     DateTime             @default(now())
  updatedAt     DateTime             @updatedAt
}

enum TransactionType {
  INCOME
  EXPENSE
}
```

**Tasks:**

- [ ] Add Transaction model to Prisma schema
- [ ] Add TransactionType enum
- [ ] Add transactions relation to FinancialAccount model
- [ ] Add transactions relation to User model
- [ ] Run migration: `prisma migrate dev --name add-transactions`
- [ ] Update Prisma client generation

#### 1.2 Update FinancialAccount Model

**Priority: MEDIUM**

```prisma
model FinancialAccount {
  // ... existing fields
  transactions  Transaction[]        // Add this relation
  lastActivity  DateTime?            // Track last transaction date
}
```

**Tasks:**

- [ ] Add transactions relation to FinancialAccount
- [ ] Add lastActivity field for real activity tracking
- [ ] Create migration for schema changes

### Phase 2: API Layer Implementation

#### 2.1 Transaction API Endpoints

**Priority: HIGH**

**Files to create:**

- [ ] `src/app/api/accounts/[id]/transactions/route.ts`
- [ ] `src/app/api/transactions/route.ts`
- [ ] `src/app/api/transactions/[id]/route.ts`

**Endpoints needed:**

```typescript
// GET /api/accounts/[id]/transactions
// - Fetch transactions for specific account
// - Support pagination (?page=1&limit=10)
// - Support filtering (?type=EXPENSE&category=Food)
// - Support date range (?from=2024-01-01&to=2024-01-31)

// POST /api/transactions
// - Create new transaction
// - Update account balance automatically
// - Validate transaction data

// PUT /api/transactions/[id]
// - Update existing transaction
// - Recalculate account balance

// DELETE /api/transactions/[id]
// - Delete transaction
// - Recalculate account balance
```

#### 2.2 Account Statistics API

**Priority: MEDIUM**

**Files to create:**

- [ ] `src/app/api/accounts/[id]/stats/route.ts`

**Functionality:**

- [ ] Calculate real monthly income/expenses from transactions
- [ ] Generate balance history from transaction data
- [ ] Calculate transaction frequency and averages
- [ ] Implement caching for performance

### Phase 3: Data Layer & Hooks

#### 3.1 Database Queries

**Priority: HIGH**

**Files to create:**

- [ ] `src/lib/queries/transactions.ts`
- [ ] `src/lib/queries/account-stats.ts`

**Query functions needed:**

```typescript
// Transaction queries
export async function getAccountTransactions(
  accountId: string,
  options?: {
    limit?: number;
    offset?: number;
    type?: TransactionType;
    category?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }
);

export async function createTransaction(data: {
  accountId: string;
  amount: number;
  description: string;
  type: TransactionType;
  category?: string;
  date?: Date;
});

// Statistics queries
export async function getAccountStatistics(
  accountId: string,
  options?: {
    monthsBack?: number;
  }
);

export async function getBalanceHistory(accountId: string, days: number = 30);
```

#### 3.2 React Hooks

**Priority: HIGH**

**Files to create:**

- [ ] `src/hooks/useTransactions.ts`
- [ ] `src/hooks/useAccountStats.ts`
- [ ] `src/hooks/useCreateTransaction.ts`

**Hook implementations:**

```typescript
// useTransactions.ts
export function useTransactions(
  accountId: string,
  options?: {
    limit?: number;
    type?: TransactionType;
  }
) {
  // React Query implementation
  // Loading states, error handling
  // Automatic refetching
}

// useAccountStats.ts
export function useAccountStats(accountId: string) {
  // Fetch account statistics
  // Cache with React Query
}

// useCreateTransaction.ts
export function useCreateTransaction() {
  // Mutation for creating transactions
  // Optimistic updates
  // Error handling
}
```

### Phase 4: Component Refactoring

#### 4.1 Remove Mock Data System

**Priority: HIGH**

**Files to modify:**

- [ ] `src/components/accounts/account-details-data.ts` - **DELETE** or convert to utilities
- [ ] `src/components/accounts/account-insights.ts` - Replace with real data queries
- [ ] `src/components/accounts/account-overview.tsx` - Use real account data
- [ ] `src/components/accounts/account-stats.tsx` - Use real statistics
- [ ] `src/components/accounts/recent-transactions.tsx` - Use real transactions

#### 4.2 AccountOverview Component

**Priority: MEDIUM**

**Tasks:**

- [ ] Replace `generateAccountInsights()` with real data
- [ ] Use real `lastActivity` from database
- [ ] Calculate real credit utilization for credit cards
- [ ] Add loading states for async data
- [ ] Handle empty states gracefully

#### 4.3 AccountStats Component

**Priority: HIGH**

**Tasks:**

- [ ] Replace mock statistics with `useAccountStats()` hook
- [ ] Implement real balance history chart
- [ ] Add date range selectors (This month, Last 3 months, etc.)
- [ ] Add loading skeletons
- [ ] Implement error states

#### 4.4 RecentTransactions Component

**Priority: HIGH**

**Tasks:**

- [ ] Replace `generateMockTransactions()` with `useTransactions()` hook
- [ ] Implement pagination for large transaction lists
- [ ] Add transaction filtering by category/type
- [ ] Add search functionality
- [ ] Implement "View all transactions" link to dedicated page
- [ ] Add transaction edit/delete functionality

#### 4.5 AccountActions Component

**Priority: MEDIUM**

**Tasks:**

- [ ] Implement real "Add Income" functionality
- [ ] Implement real "Add Expense" functionality
- [ ] Create transaction form modal/page
- [ ] Add account editing functionality
- [ ] Implement account deletion with confirmations
- [ ] Add account settings management

### Phase 5: Form Components & Modals

#### 5.1 Transaction Form

**Priority: HIGH**

**Files to create:**

- [ ] `src/components/transactions/transaction-form.tsx`
- [ ] `src/components/transactions/transaction-form-modal.tsx`
- [ ] `src/lib/validators/transaction.validator.ts`

**Features:**

```typescript
interface TransactionFormData {
  amount: number;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  category?: string;
  date: Date;
  accountId: string;
}
```

**Tasks:**

- [ ] Create form with react-hook-form
- [ ] Add Zod validation
- [ ] Category selection dropdown
- [ ] Date picker integration
- [ ] Amount input with currency formatting
- [ ] Auto-focus and keyboard navigation

#### 5.2 Account Edit Form

**Priority: MEDIUM**

**Files to create:**

- [ ] `src/components/accounts/edit-account-form.tsx`
- [ ] `src/components/accounts/edit-account-modal.tsx`

**Tasks:**

- [ ] Edit account name, type, currency
- [ ] Validation and error handling
- [ ] Optimistic updates
- [ ] Cancel/save functionality

### Phase 6: Advanced Features

#### 6.1 Transaction Categories Management

**Priority: LOW**

**Tasks:**

- [ ] Create category management system
- [ ] Default categories seeding
- [ ] Custom category creation
- [ ] Category icons and colors
- [ ] Category-based analytics

#### 6.2 Bulk Operations

**Priority: LOW**

**Tasks:**

- [ ] Bulk transaction import (CSV)
- [ ] Bulk transaction deletion
- [ ] Transaction export functionality
- [ ] Bulk category assignment

#### 6.3 Advanced Analytics

**Priority: LOW**

**Tasks:**

- [ ] Monthly/yearly spending trends
- [ ] Category breakdown charts
- [ ] Spending vs income analysis
- [ ] Budget tracking integration
- [ ] Export reports functionality

### Phase 7: Performance & UX

#### 7.1 Performance Optimization

**Priority: MEDIUM**

**Tasks:**

- [ ] Implement pagination for large transaction lists
- [ ] Add virtual scrolling for performance
- [ ] Optimize database queries with proper indexing
- [ ] Implement React Query caching strategies
- [ ] Add request debouncing for search/filters

#### 7.2 Loading States & Skeletons

**Priority: MEDIUM**

**Tasks:**

- [ ] Create transaction list skeleton
- [ ] Create account stats skeleton
- [ ] Implement progressive loading
- [ ] Add spinner components
- [ ] Handle network error states

#### 7.3 Mobile Experience

**Priority: MEDIUM**

**Tasks:**

- [ ] Optimize touch interactions
- [ ] Add pull-to-refresh functionality
- [ ] Implement swipe actions for transactions
- [ ] Mobile-specific transaction form
- [ ] Responsive chart components

### Phase 8: Testing & Documentation

#### 8.1 Unit Testing

**Priority: MEDIUM**

**Files to create:**

- [ ] `src/components/accounts/__tests__/account-overview.test.tsx`
- [ ] `src/components/accounts/__tests__/account-stats.test.tsx`
- [ ] `src/components/accounts/__tests__/recent-transactions.test.tsx`
- [ ] `src/hooks/__tests__/useTransactions.test.ts`
- [ ] `src/lib/queries/__tests__/transactions.test.ts`

#### 8.2 Integration Testing

**Priority: LOW**

**Tasks:**

- [ ] Test account creation to transaction flow
- [ ] Test balance calculation accuracy
- [ ] Test transaction CRUD operations
- [ ] Test account deletion cascade

#### 8.3 Documentation Updates

**Priority: LOW**

**Tasks:**

- [ ] Update API documentation
- [ ] Component usage documentation
- [ ] Database schema documentation
- [ ] Deployment guide updates

## Implementation Priority

### Sprint 1 (Critical - 1-2 weeks)

1. Database schema & migrations (1.1, 1.2)
2. Transaction API endpoints (2.1)
3. Basic React hooks (3.2)
4. Remove mock data from core components (4.1, 4.3, 4.4)

### Sprint 2 (Important - 1-2 weeks)

1. Account statistics API (2.2)
2. Transaction form components (5.1)
3. Complete component refactoring (4.2, 4.5)
4. Loading states implementation (7.2)

### Sprint 3 (Enhancement - 1-2 weeks)

1. Account edit functionality (5.2)
2. Performance optimizations (7.1)
3. Mobile experience improvements (7.3)
4. Advanced transaction features (6.1)

### Sprint 4 (Polish - 1 week)

1. Testing implementation (8.1)
2. Documentation updates (8.3)
3. Bulk operations (6.2)
4. Advanced analytics (6.3)

## Definition of Done

- [ ] All mock data replaced with real database queries
- [ ] Full CRUD operations for transactions
- [ ] Proper error handling and loading states
- [ ] Mobile-responsive design maintained
- [ ] TypeScript types for all new components
- [ ] Basic test coverage for core functionality
- [ ] Updated documentation

## Notes

- **Backward Compatibility**: Ensure account cards continue working during transition
- **Data Migration**: Plan for migrating any existing account data
- **Performance**: Monitor query performance with real data volumes
- **User Experience**: Maintain current UX quality throughout refactoring

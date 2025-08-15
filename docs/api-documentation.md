# API Documentation

## Current API Endpoints (MVP)

### Authentication

- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/session` - Get current session

### Accounts

- `GET /api/accounts` - List user accounts
- `POST /api/accounts` - Create new account
- `PUT /api/accounts/[id]` - Update account
- `DELETE /api/accounts/[id]` - Delete account
- `GET /api/accounts/[id]/transactions` - Paginated & filterable transactions (query: page, limit, type, category, from, to)
- `GET /api/accounts/[id]/statistics` - Unified monthly & recent metrics (income, expenses, netChange, trend, trendPercentage, transactionsCount, averageTransaction, 7-day balanceHistory, lastActivity, activityStatus)

### Transactions

- `POST /api/transactions` - Create transaction (recomputes account balance & lastActivity)
- `GET /api/transactions/[id]` - Get single transaction
- `PUT /api/transactions/[id]` - Update transaction (balance recomputed)
- `DELETE /api/transactions/[id]` - Delete transaction (balance recomputed)

`/api/expenses` deprecated / superseded by unified transactions model.

### Products & Planning

- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/planned-items` - List planned purchases
- `POST /api/planned-items` - Add planned purchase

## Post-MVP API Enhancements

### Phase 2: OCR & Smart Features

**Receipt Processing:**

```typescript
// POST /api/receipts/upload
interface ReceiptUploadRequest {
  file: File;
  expenseId?: string;
}

interface ReceiptUploadResponse {
  receiptId: string;
  processingStatus: 'queued' | 'processing' | 'completed' | 'failed';
  estimatedCompletion?: string;
}

// GET /api/receipts/[id]/status
interface ReceiptStatusResponse {
  status: 'processing' | 'completed' | 'failed';
  result?: OCRResult;
  error?: string;
  confidence?: number;
}

// POST /api/receipts/[id]/correct
interface ReceiptCorrectionRequest {
  correctedData: OCRResult;
  userFeedback: string;
}
```

**Enhanced Product Management:**

```typescript
// GET /api/products/search?q=milk
interface ProductSearchResponse {
  products: Product[];
  suggestions: ProductSuggestion[];
  categories: CategorySuggestion[];
}

// POST /api/products/match
interface ProductMatchRequest {
  extractedItems: ExtractedItem[];
}

interface ProductMatchResponse {
  matches: ProductMatch[];
  newProducts: Product[];
  confidence: number;
}
```

### Phase 3: Multi-User & Collaboration

**Household Management:**

```typescript
// POST /api/households
interface CreateHouseholdRequest {
  name: string;
  description?: string;
}

// POST /api/households/[id]/invite
interface InviteUserRequest {
  email: string;
  role: 'OWNER' | 'PARTNER' | 'USER';
  message?: string;
}

// POST /api/invitations/[token]/accept
interface AcceptInvitationRequest {
  token: string;
}

// GET /api/households/[id]/activity
interface ActivityFeedResponse {
  activities: Activity[];
  pagination: PaginationInfo;
}
```

**Budget Management:**

```typescript
// POST /api/budgets
interface CreateBudgetRequest {
  name: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  category?: string;
  householdId: string;
}

// GET /api/budgets/[id]/status
interface BudgetStatusResponse {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

// POST /api/recurring-transactions
interface CreateRecurringTransactionRequest {
  amount: number;
  description: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextDue: string;
  accountId: string;
  categoryId?: string;
}
```

### Phase 4: Advanced Features

**Analytics & Insights:**

```typescript
// GET /api/analytics/spending-trends
interface SpendingTrendsRequest {
  period: '3months' | '6months' | '1year';
  category?: string;
  userId?: string;
}

interface SpendingTrendsResponse {
  trends: TrendData[];
  insights: AIInsight[];
  recommendations: Recommendation[];
}

// GET /api/analytics/price-history
interface PriceHistoryRequest {
  productId: string;
  timeframe: string;
}

// POST /api/analytics/custom-report
interface CustomReportRequest {
  filters: ReportFilter[];
  groupBy: string[];
  metrics: string[];
  format: 'json' | 'csv' | 'pdf';
}
```

**Goal Management:**

```typescript
// POST /api/goals
interface CreateGoalRequest {
  name: string;
  targetAmount: number;
  targetDate: string;
  category?: string;
}

// PUT /api/goals/[id]/progress
interface UpdateGoalProgressRequest {
  amount: number;
  note?: string;
}

// GET /api/goals/[id]/projections
interface GoalProjectionsResponse {
  projectedCompletion: string;
  requiredMonthlyContribution: number;
  likelihood: 'high' | 'medium' | 'low';
  suggestions: string[];
}
```

**Notification System:**

```typescript
// GET /api/notifications
interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

// POST /api/notifications/preferences
interface NotificationPreferencesRequest {
  budgetAlerts: boolean;
  goalReminders: boolean;
  weeklyReports: boolean;
  collaborationUpdates: boolean;
  emailFrequency: 'instant' | 'daily' | 'weekly' | 'never';
}

// POST /api/notifications/[id]/mark-read
interface MarkNotificationReadRequest {
  notificationId: string;
}
```

## API Design Principles

### Authentication & Authorization

- All endpoints require authentication via NextAuth.js session
- Role-based access control for household-specific endpoints
- API rate limiting to prevent abuse
- Request validation using Zod schemas

### Error Handling

```typescript
interface APIError {
  error: string;
  message: string;
  code: number;
  details?: any;
}

// Standard error responses
// 400 - Bad Request (validation errors)
// 401 - Unauthorized (not authenticated)
// 403 - Forbidden (insufficient permissions)
// 404 - Not Found
// 429 - Too Many Requests
// 500 - Internal Server Error
```

### Response Formats

```typescript
interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: PaginationInfo;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

### Performance Optimization

- Response caching for frequently accessed data
- Pagination for large datasets
- GraphQL-style field selection for complex queries
- Background job processing for heavy operations

## Webhook Support (Phase 4)

**Webhook Events:**

```typescript
interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  householdId: string;
}

// Supported event types:
// - expense.created
// - budget.exceeded
// - receipt.processed
// - goal.completed
// - user.invited
```

**Webhook Configuration:**

```typescript
// POST /api/webhooks
interface CreateWebhookRequest {
  url: string;
  events: string[];
  secret?: string;
}

// GET /api/webhooks/[id]/logs
interface WebhookLogsResponse {
  logs: WebhookLog[];
  successRate: number;
}
```

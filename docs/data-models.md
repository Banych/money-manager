# Data Models & Entity Relationships

## Core Models (Phase 1)

### User & Auth

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          String    @default("USER")
  accounts      Account[]
  expenses      Expense[]
  plannedItems  PlannedItem[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  expires      DateTime
}
```

### Account & Transactions

```prisma
model Account {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  name      String
  balance   Float     @default(0)
  currency  String    @default("EUR")
  expenses  Expense[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Expense {
  id         String        @id @default(cuid())
  amount     Float
  description String?
  date       DateTime      @default(now())
  accountId  String
  account    Account       @relation(fields: [accountId], references: [id])
  userId     String
  user       User          @relation(fields: [userId], references: [id])
  items      ExpenseItem[]
  createdAt  DateTime      @default(now())
  receiptUrl String?
}

model ExpenseItem {
  id        String   @id @default(cuid())
  name      String
  price     Float
  quantity  Int      @default(1)
  expenseId String
  expense   Expense  @relation(fields: [expenseId], references: [id])
  product   Product? @relation(fields: [productId], references: [id])
  productId String?
}
```

### Products & Planning

```prisma
model Product {
  id         String          @id @default(cuid())
  name       String          @unique
  avgPrice   Float?
  category   String?
  history    ExpenseItem[]
  planned    PlannedItem[]
  createdAt  DateTime        @default(now())
  updatedAt  DateTime        @updatedAt
}

model PlannedItem {
  id         String   @id @default(cuid())
  name       String
  priceHint  Float?
  priority   Int      @default(1)
  purchased  Boolean  @default(false)
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  productId  String?
  product    Product? @relation(fields: [productId], references: [id])
  createdAt  DateTime @default(now())
}
```

## Future Models (Phase 2+)

### OCR & Receipt Processing (Phase 2)

```prisma
model Receipt {
  id          String          @id @default(cuid())
  url         String
  fileName    String
  uploadedAt  DateTime        @default(now())
  processed   Boolean         @default(false)
  ocrProvider String?         // "google-vision", "mindee", etc.
  rawOcrData  Json?          // Store raw OCR response
  merchantName String?
  date        DateTime?
  total       Float?
  confidence  Float?         // OCR confidence score
  expenseId   String?        @unique
  expense     Expense?       @relation(fields: [expenseId], references: [id])
  extractedItems ExtractedItem[]
}

model ExtractedItem {
  id         String   @id @default(cuid())
  receiptId  String
  name       String
  price      Float
  quantity   Int      @default(1)
  confidence Float?   // Item extraction confidence
  matched    Boolean  @default(false)
  productId  String?
  receipt    Receipt  @relation(fields: [receiptId], references: [id])
  product    Product? @relation(fields: [productId], references: [id])
}
```

### Multi-User Support (Phase 3)

```prisma
model Household {
  id          String            @id @default(cuid())
  name        String
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  members     HouseholdMember[]
  accounts    Account[]
  budgets     Budget[]
  invitations HouseholdInvitation[]
}

model HouseholdMember {
  id          String     @id @default(cuid())
  userId      String
  householdId String
  role        Role       @default(USER)
  joinedAt    DateTime   @default(now())
  user        User       @relation(fields: [userId], references: [id])
  household   Household  @relation(fields: [householdId], references: [id])

  @@unique([userId, householdId])
}

model HouseholdInvitation {
  id          String    @id @default(cuid())
  email       String
  role        Role      @default(USER)
  token       String    @unique
  householdId String
  invitedById String
  expiresAt   DateTime
  acceptedAt  DateTime?
  household   Household @relation(fields: [householdId], references: [id])
  invitedBy   User      @relation(fields: [invitedById], references: [id])
  createdAt   DateTime  @default(now())
}

enum Role {
  OWNER
  PARTNER
  USER
}
```

### Budgeting & Analytics (Phase 3)

```prisma
model Budget {
  id          String    @id @default(cuid())
  name        String
  amount      Float
  period      String    @default("monthly") // monthly, weekly, yearly
  category    String?
  householdId String
  household   Household @relation(fields: [householdId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Category {
  id          String      @id @default(cuid())
  name        String
  color       String?     // Hex color for UI
  icon        String?     // Icon identifier
  parentId    String?     // For subcategories
  parent      Category?   @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[]  @relation("CategoryHierarchy")
  expenses    Expense[]
  budgets     Budget[]
  createdAt   DateTime    @default(now())
}

model RecurringTransaction {
  id          String    @id @default(cuid())
  amount      Float
  description String
  frequency   String    // "weekly", "monthly", "yearly"
  nextDue     DateTime
  accountId   String
  account     Account   @relation(fields: [accountId], references: [id])
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### Advanced Features (Phase 4)

```prisma
model Goal {
  id          String    @id @default(cuid())
  name        String
  targetAmount Float
  currentAmount Float   @default(0)
  targetDate  DateTime
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  isCompleted Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Notification {
  id          String    @id @default(cuid())
  title       String
  message     String
  type        String    // "budget_alert", "goal_reminder", etc.
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  isRead      Boolean   @default(false)
  actionUrl   String?   // Optional URL for notification action
  createdAt   DateTime  @default(now())
}

model AuditLog {
  id          String    @id @default(cuid())
  action      String    // "expense_created", "budget_updated", etc.
  entityType  String    // "expense", "budget", "account"
  entityId    String
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  oldData     Json?     // Previous state (for updates)
  newData     Json?     // New state
  createdAt   DateTime  @default(now())
}
```

## Relationships

- User ↔ Accounts (1:N)
- Account ↔ Expenses (1:N)
- Expense ↔ ExpenseItems (1:N)
- ExpenseItem ↔ Product (N:1, optional)
- Product ↔ PlannedItem (1:N)
- User ↔ PlannedItem (1:N)

## Data Flow Example

1. **User adds a new expense** (optionally with receipt image).
2. **Expense** is created, linked to Account and User, with ExpenseItems referencing Products.
3. **PlannedItem** can be marked as bought, linking to actual ExpenseItem.
4. **Analytics** module aggregates data for dashboards and reports.

## Extensibility

- Add new models (e.g., `Household`, `Budget`) as needed in later phases.
- Use enums for categories, currencies, or transaction types.
- Consider soft deletes (`deletedAt`) for audit/history.

See [docs/auth.md](./auth.md) for session and role handling.

## Model Evolution Plan

### Phase 2 Additions

- Add `Receipt` and `ExtractedItem` models for OCR processing
- Extend `Expense` model with `receiptId` and `categoryId` fields
- Add confidence scoring and OCR metadata

### Phase 3 Additions

- Add `Household`, `HouseholdMember`, and `HouseholdInvitation` for multi-user
- Add `Budget`, `Category`, and `RecurringTransaction` for budgeting
- Extend `Account` to link to households instead of just users
- Add user activity tracking and permissions

### Phase 4 Additions

- Add `Goal`, `Notification`, and `AuditLog` for advanced features
- Add analytics aggregation tables (if needed for performance)
- Add external integration models (bank connections, etc.)

## Migration Strategy

- Use Prisma Migrate for schema changes
- Implement backward-compatible changes where possible
- Plan data migration scripts for major model changes
- Maintain database backups before major migrations

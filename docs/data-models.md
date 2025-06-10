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
  expenseId   String?        @unique
  expense     Expense?       @relation(fields: [expenseId], references: [id])
}
```

### Multi-User Support (Phase 3)

```prisma
enum Role {
  OWNER
  PARTNER
  USER
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

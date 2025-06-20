# Feature Roadmap & Milestones

Based on the chat discussion, this roadmap prioritizes simplicity and core functionality first.

## Phase 1: Core MVP (3-5 weeks)

**Goal:** Build a working money tracker without AI features

**Core Features:**

- ✅ User authentication (NextAuth.js with Google OAuth)
- ✅ Account creation and management (multiple wallets/cards)
- ✅ Add income/spending, assign to specific account
- ✅ Manual item addition to spends (what you bought)
- ✅ Dashboard with totals per account
- ✅ Basic goods database (manual entry from spends)
- ✅ Planned purchases (wishlist with price suggestions from history)
- ✅ Basic analytics (monthly spend, per category)

**Tech Stack:**

- Next.js (App Router), Prisma, PostgreSQL (Supabase), Tailwind CSS, shadcn/ui

## Phase 2: Smart Features (2-3 weeks)

**Goal:** Add AI functionality and automatic spend breakdown

**Smart Features:**

- Receipt upload and OCR parsing
- AI extracts merchant, date, total, item list
- Manual correction UI for OCR results
- Auto-link parsed items to goods database

## Phase 3: Collaboration & Budgeting (2-4 weeks)

**Goal:** Enable multiple users per household, with better control

**Collaboration & Budgeting Features:**

- Invite users to household/group
- Assign spends to users
- Shared budgets and permissions
- Recurring income/spends
- Overspending alerts

## Phase 4: Advanced Features & Polish (optional)

**Goal:** Add wow factor and mobile-first features

**Advanced Features:**

- PWA/mobile camera integration
- Price tracking and prediction for goods
- Export to CSV/Excel
- Bank import (CSV files)
- Gamified savings goals
- Notifications for planned purchases
- Search/filter across items
- AI insights (e.g., "You’re overspending on coffee")

---

## Technical Roadmap

- Set up CI/CD with GitHub Actions and Vercel
- Automated testing (unit, integration, e2e)
- Error monitoring (Sentry/Highlight.io)
- Database migrations with Prisma Migrate
- PWA support (manifest, offline caching)
- Internationalization (i18n) support

---

## Future Ideas

- Bank API integrations (Open Banking)
- Real-time collaboration (Supabase Realtime/WebSockets)
- Advanced AI insights (spending predictions, anomaly detection)
- End-to-end encryption for sensitive data
- Marketplace for financial products or offers

---

## Post-MVP Enhancements

### Phase 2 Detailed Features

**OCR & Receipt Processing:**

- **Receipt Upload UI:** Drag-and-drop or camera capture interface
- **Google Vision API Integration:** Extract text, merchant name, date, total amount
- **Item Parser:** AI-powered parsing of individual items from receipt text
- **Confidence Scoring:** Show OCR confidence levels for manual review
- **Correction Interface:** Easy editing of parsed data before saving
- **Receipt Storage:** Secure storage in Supabase with automatic cleanup
- **Batch Processing:** Queue system for processing multiple receipts

**Enhanced Product Matching:**

- **Fuzzy Matching:** Match similar product names using string similarity
- **Learning System:** Improve matching based on user corrections
- **Category Auto-Assignment:** Suggest categories based on product names
- **Price History:** Track price changes over time for same products

### Phase 3 Detailed Features

**Multi-User Collaboration:**

- **Household Management:** Create/manage household groups
- **Invitation System:** Email invites with role assignment
- **Permission Levels:** OWNER (full access), PARTNER (view/edit), USER (view only)
- **Shared Accounts:** Multiple users can access same accounts
- **Activity Feed:** See who added what expenses in real-time
- **User Attribution:** Track which user made each transaction

**Budgeting & Alerts:**

- **Monthly Budgets:** Set spending limits by category or total
- **Smart Alerts:** Email/push notifications for budget overruns
- **Spending Patterns:** Identify unusual spending behavior
- **Recurring Transactions:** Auto-add salary, bills, subscriptions
- **Budget Templates:** Pre-built budgets for different household types

**Advanced Analytics:**

- **Trend Analysis:** Spending trends over 3, 6, 12 months
- **Category Breakdown:** Detailed spending by custom categories
- **Comparison Views:** Month-over-month, year-over-year comparisons
- **Export Features:** CSV, Excel, PDF reports
- **Data Visualization:** Interactive charts and graphs

### Phase 4 Detailed Features

**Mobile & PWA Features:**

- **Progressive Web App:** Installable app with offline capabilities
- **Camera Integration:** Direct receipt capture on mobile devices
- **Push Notifications:** Real-time alerts for budgets and planned purchases
- **Offline Mode:** Basic functionality without internet connection
- **Touch Optimizations:** Swipe gestures, touch-friendly interfaces

**AI & Automation:**

- **Spending Insights:** "You're spending 20% more on groceries this month"
- **Price Predictions:** Forecast future prices for planned purchases
- **Smart Categories:** Auto-categorize expenses based on merchant
- **Anomaly Detection:** Flag unusual transactions for review
- **Recommendation Engine:** Suggest budget adjustments based on patterns

**Advanced Integrations:**

- **Bank Import:** CSV/OFX file import from bank statements
- **API Integrations:** Connect to banking APIs (future)
- **Calendar Integration:** Link planned purchases to calendar events
- **Shopping Lists:** Convert planned purchases to shopping apps
- **Financial Goals:** Long-term savings and spending goals

---

## Implementation Priority

### High Priority (Phase 2)

1. Receipt OCR with Google Vision API
2. Basic multi-user household setup
3. Simple budgeting (monthly limits)

### Medium Priority (Phase 3)

1. Advanced analytics and reporting
2. Mobile PWA optimization
3. Recurring transaction automation

### Low Priority (Phase 4)

1. AI insights and recommendations
2. External integrations
3. Advanced mobile features

---

_See [docs/architecture.md](./architecture.md) for the big-picture overview._

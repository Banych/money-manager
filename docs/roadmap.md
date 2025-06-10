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

_See [docs/architecture.md](./architecture.md) for the big-picture overview._

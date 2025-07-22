# Money Manager App – Architecture Overview

## Global Goal & App Description

The Money Manager app is a full-stack, mobile-first platform for couples and families to collaboratively manage finances. Its primary objective is to provide a seamless, modern experience for tracking spending, income, and accounts, with optional AI-powered receipt scanning to simplify data entry.

### Core Features (MVP Focus)

- **Multi-Account Support:** Create multiple accounts (wallets, cards, etc.) to track different money sources
- **Income & Expense Tracking:** Add spending and income, assign to specific accounts, with detailed itemization
- **Planned Purchases:** Maintain a wishlist of goods to buy, with price suggestions based on historical data
- **Basic Analytics:** Visualize spending over time, broken down by category and account
- **Mobile-First UI:** Minimalistic, responsive design optimized for both mobile and desktop

### Future Features (Later Phases)

- **AI-Powered Receipt Scanning:** Upload receipts; AI extracts merchant, date, total, and itemized goods
- **Multi-User Collaboration:** Invite family members, role-based permissions, shared budgets
- **Advanced Analytics:** Budgets, overspending alerts, price trends for specific goods

---

## 1. Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes (App Router)
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Authentication:** NextAuth.js (+ Prisma Adapter)
- **File Storage:** Supabase Storage
- **AI/OCR:** External API (Google Vision, Mindee, etc.)
- **Deployment:** Vercel
- **Typesafety:** TypeScript
- **Validation:** Zod
- **State Management:** React Context / Zustand

---

## 2. Key Modules

- **Identity:** Users, households, roles, authentication
- **Finance:** Accounts, transactions, balances
- **Items:** Goods, item history, planned purchases
- **Recipes:** Meal planning, ingredient management, shopping integration
- **OCR:** Receipt scanning, AI parsing, item extraction
- **Analytics:** Trends, budgets, reports

---

## 3. Folder Structure

See [docs/folder-structure.md](./folder-structure.md) for a detailed breakdown.

---

## 4. Data Models

See [docs/data-models.md](./data-models.md) for Prisma schema and entity relationships.

---

## 5. Authentication & Authorization

See [docs/auth.md](./auth.md) for NextAuth.js setup, session handling, and role-based access.

---

## 6. Feature Roadmap

See [docs/roadmap.md](./roadmap.md) for phased feature delivery and milestones.

---

## 7. Design & UX

See [docs/ui-design.md](./ui-design.md) for design principles and screen references.

---

## 8. Development Practices

- ESLint + Prettier for code quality
- Husky + lint-staged for pre-commit checks (TBD)
- Jest/Vitest for unit tests, Playwright/Cypress for e2e (TBD)
- Storybook for UI components (TBD)

---

## 9. References

- [chat.md](./chat.md): Full planning conversation and code snippets
- [development-guide.md](./development-guide.md): Step-by-step development approach
- [api-documentation.md](./api-documentation.md): Complete API reference for all phases
- [Supabase Docs](https://supabase.com/docs)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Prisma Docs](https://www.prisma.io/docs/)

---

## 10. Security & Privacy

- **Authentication:** All sensitive routes require authentication via NextAuth.js.
- **Authorization:** Role-based access control for all critical actions (e.g., only owners can invite users or manage accounts).
- **Data Privacy:** User data is stored securely in Supabase/PostgreSQL. Sensitive data (e.g., account balances, transactions) is never exposed in the session/JWT.
- **Encryption:** All communication is over HTTPS. Optionally, sensitive fields can be encrypted at rest.
- **File Storage:** Receipts and images are stored in Supabase Storage with access controls.
- **Compliance:** The app is designed to be GDPR-friendly (user data export, deletion).

---

## 11. Extensibility & Future Directions

- Start simple with core features, add complexity gradually
- Modular architecture allows easy addition of new features
- Database schema designed for easy extension
- API-first approach enables future mobile app development

---

## 12. Testing & Quality Assurance

- **Unit Testing:** Use Jest or Vitest for business logic and utility functions.
- **Integration Testing:** Use Playwright or Cypress for end-to-end flows (auth, spend, OCR).
- **Component Testing:** Storybook for UI isolation and visual regression.
- **Linting & Formatting:** ESLint, Prettier, and husky/lint-staged for consistent code quality.

---

## 13. DevOps & CI/CD

- **Deployment:** Vercel for frontend and API, Supabase for database and storage.
- **CI/CD:** GitHub Actions for automated testing, linting, and preview deployments.
- **Monitoring:** Sentry or Highlight.io for error tracking and performance monitoring.
- **Database Management:** Prisma Migrate for schema changes, Supabase Studio for DB admin.

---

## 14. Known Limitations & Open Questions

- **OCR Accuracy:** Receipt parsing depends on third-party AI/OCR quality; manual correction UI is essential.
- **Real-Time Collaboration:** Current architecture is request/response; real-time features (e.g., live updates) would require WebSockets or Supabase Realtime.
- **Scaling:** Designed for small teams/families; scaling to large organizations may require architectural adjustments.

---

## 15. TypeScript Type-Safety for Auth

NextAuth.js does not include custom user/session fields (like `role`, `image`, etc.) in its types by default. To ensure type-safety and autocompletion for these fields throughout your app, you must use TypeScript module augmentation.

- Create a file: `types/next-auth.d.ts`
- Extend the `Session`, `User`, and `JWT` interfaces to include all custom fields you add in your NextAuth callbacks (e.g., `id`, `role`, `name`, `email`, `image`).
- Make sure this file is included in your `tsconfig.json` or imported once in your app.

See [docs/auth.md](./auth.md) for a full example.

---

## 16. UI Design Handoff & Visual References

- **Design Mockups:** The project includes a set of minimalistic, mobile-first UI mockups for all major screens (dashboard, accounts, add spending, planned purchases, analytics, profile, receipt scanner, etc.).
- **Design Documentation:** All UI/UX decisions, screen flows, and component states should be documented in [docs/ui-design.md](./ui-design.md).
- **Visual Assets:** Store exported images, Figma/Sketch files, or screenshots in a `/docs/design-images` folder for easy reference by developers and designers.
- **Handoff Process:** Ensure that any updates to the UI (new screens, changes to flows, etc.) are reflected in both the documentation and the design assets folder.

---

## 17. Internationalization & Localization

- **i18n Ready:** The architecture is designed to support multiple languages and regional formats.
- **Localization:** UI text, date, and currency formatting should use libraries like `next-intl`, `react-intl`, or `date-fns` for locale-aware display.
- **Folder Structure:** Place translation files in `/locales` or similar.
- **Future:** Add language switcher and region-specific settings as the user base grows.

---

## 18. API Rate Limiting & Abuse Prevention

- **Public Endpoints:** For endpoints like receipt upload or OCR, implement rate limiting (e.g., via middleware or Vercel Edge Functions) to prevent abuse.
- **Monitoring:** Track API usage and error rates for early detection of misuse.
- **Security:** Validate and sanitize all file uploads and user input.

---

## 19. Post-MVP Architecture Considerations

### Phase 2: OCR & Smart Features

**New Components:**

- **OCR Service Layer:** Abstraction for multiple OCR providers (Google Vision, Mindee, OpenAI)
- **File Upload Manager:** Handle receipt images with validation and compression
- **Background Job Queue:** Process OCR requests asynchronously (using Vercel Edge Functions or external queue)
- **Confidence Scoring:** UI components to display and handle OCR confidence levels

**Architecture Changes:**

- Add `/lib/ocr/` module for OCR provider abstraction
- Extend API routes for file upload and processing
- Add database triggers for automatic product matching
- Implement caching for frequently accessed products

### Phase 3: Multi-User & Collaboration

**New Components:**

- **Household Management:** User invitation system with email verification
- **Permission System:** Role-based access control middleware
- **Real-time Updates:** Optional WebSocket integration for live collaboration
- **Activity Tracking:** Audit log for user actions

**Architecture Changes:**

- Extend authentication to include household context
- Add row-level security (RLS) in Supabase for data isolation
- Implement invitation token system with expiration
- Add background jobs for notification delivery

### Phase 4: Advanced Features & Scale

**New Components:**

- **Analytics Engine:** Aggregation services for spending insights
- **Notification System:** Multi-channel notification delivery (email, push, in-app)
- **External Integrations:** API clients for banking, calendar, shopping services
- **AI Insights Service:** Machine learning for spending pattern analysis

**Architecture Changes:**

- Consider microservices for heavy computation (analytics, AI)
- Add caching layer (Redis) for frequently accessed data
- Implement data warehousing for historical analytics
- Add monitoring and observability tools

### Scaling Considerations

**Database Optimization:**

- Add database indexes for frequently queried fields
- Consider read replicas for analytics queries
- Implement data archiving for old transactions
- Add database connection pooling

**Performance:**

- Implement CDN for static assets and images
- Add API response caching
- Optimize bundle size with code splitting
- Add service worker for offline capabilities

**Security Enhancements:**

- Add API rate limiting per user/household
- Implement data encryption for sensitive fields
- Add security headers and CSRF protection
- Regular security audits and dependency updates

---

_See sub-documents in `docs/` for full details on each area._

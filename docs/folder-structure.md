# Folder & Module Structure

## Top-Level Layout

```
/app                   # Next.js App Router
  /api                 # API routes (Next.js handlers)
  /dashboard           # Authenticated pages
  /auth                # Login/Register etc.
  /accounts            # Account management
  /expenses            # Add/view/edit spendings
  /receipts            # Scanned receipt pages
  /planned             # Planned purchases
/components            # Reusable UI components
/constants             # Static constants/enums
/hooks                 # Custom React hooks
/lib
  prisma.ts            # Prisma client setup
  auth.ts              # Auth helpers (e.g., getServerSession)
  ocr.ts               # OCR API wrapper
/middleware.ts         # Middleware for route protection
/prisma
  schema.prisma        # Prisma schema
/public                # Static files
/styles                # Tailwind or global styles
/types                 # Global TypeScript types
/utils                 # General helpers (formatting, math, etc.)
/validators            # Input validation schemas
```

## Key Principles

- **Keep it simple:** Start with a flat structure, organize into modules only when needed
- **App Router:** Use Next.js 13+ App Router for better organization
- **Shared components:** Reusable UI components in `/components`
- **Type safety:** Global types in `/types`, specific validation in `/validators`
  /utils
  /types
  /apiClients
```

## Additional Folders

- `/tests` – Unit and integration tests (Jest/Vitest, Playwright/Cypress)
- `/locales` – For i18n/l10n (future multi-language support)
- `/public/manifest.json` – For PWA/mobile support
- `/scripts` – Utility scripts (e.g., DB seeding, migrations)
- `/docs` – Project documentation (this folder)

## Extensibility

- Modular structure allows adding new modules (e.g., `/modules/banking` for bank API integration).
- `/lib/aiClient.ts` can be extended for new AI/OCR providers.
- `/modules/analytics` can be expanded for advanced reporting.

## Notes

- Keep business logic in `/modules/*/domain` and `/modules/*/application`.
- Use `/lib` for cross-cutting concerns (Prisma, Auth, OCR).
- Place UI components in `/components` and module-specific UI in `/modules/*/ui`.
- Use `/validators` for Zod/Yup schemas.

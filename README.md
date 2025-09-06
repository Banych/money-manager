# This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 💡 Project Overview

Money Manager is a modern, mobile-first budgeting app for couples and families. It focuses on clear expense tracking, multi-account management, and will progressively add AI-powered receipt scanning, collaboration, and analytics.

### Current Phase (as of 2025-08-15)

Late Phase 1 – Core MVP foundation: unified account statistics (`/api/accounts/[id]/statistics`) and transaction CRUD implemented. Remaining: pagination UI polish, edit/delete UI, tests & CI.

### Feature Snapshot

| Feature                            | Status             |
| ---------------------------------- | ------------------ |
| Auth (Google)                      | ✅                 |
| Account CRUD                       | ✅                 |
| Transaction Create                 | ✅                 |
| Transaction List / Update / Delete | ✅ Backend / 🚧 UI |
| Account Statistics (unified)       | ✅                 |
| Analytics Dashboards               | ❌                 |
| Planned Purchases                  | 🚧 / Partial       |
| Recipes                            | 📘 Planned         |
| Tests & CI                         | ❌                 |
| Monitoring                         | ❌                 |

## 🏗️ Tech Stack

| Layer    | Tech/Tool             |
| -------- | --------------------- |
| Frontend | Next.js, Tailwind CSS |
| Backend  | Next.js API Routes    |
| Database | PostgreSQL (Supabase) |
| ORM      | Prisma                |
| Auth     | NextAuth.js           |
| OCR      | External API          |
| Storage  | Supabase Storage      |
| Deploy   | Vercel                |
| Typesafe | TypeScript            |

## 📁 Project Structure

See [docs/architecture.md](docs/architecture.md) for details.

Progress & session logs: [docs/progress](docs/progress/)

### 🕒 Date & Time Formatting

All date/time rendering uses centralized `dayjs` helpers in `src/lib/date.ts` to avoid hydration mismatches and ensure consistency. See `docs/date-formatting.md` for full guidelines. Do not use `toLocaleString` / `toLocaleDateString` directly in UI code.

## 🚀 Getting Started

1. Clone repo
2. Copy `.env.example` to `.env` and fill in secrets (see Environment section below)
3. `yarn`
4. `yarn dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### 🔐 Environment Variables

Create `.env` from `.env.example`:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
DIRECT_URL=postgresql://user:password@host:5432/dbname
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace_with_strong_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

`DIRECT_URL` optional (used for Prisma direct connection). Generate `NEXTAUTH_SECRET` via `openssl rand -base64 32`.

### 📊 Key API Endpoints (MVP data layer)

| Purpose                           | Method & Path                                            |
| --------------------------------- | -------------------------------------------------------- |
| List account transactions         | `GET /api/accounts/:id/transactions`                     |
| Unified account statistics        | `GET /api/accounts/:id/statistics`                       |
| Create transaction                | `POST /api/transactions`                                 |
| Get / Update / Delete transaction | `GET/PUT/DELETE /api/transactions/:id`                   |
| Accounts CRUD                     | `GET/POST /api/accounts`, `PUT/DELETE /api/accounts/:id` |

Legacy `/stats` & `/insights` endpoints removed in favor of `/statistics`.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

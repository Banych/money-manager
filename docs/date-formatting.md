# Date & Time Formatting Standard

This project standardizes all date and time handling using **dayjs** wrappers located in `src/lib/date.ts`.

## Goals

- Eliminate hydration mismatches caused by locale-dependent rendering.
- Provide a single place to adjust formatting (future i18n / timezones).
- Ensure consistent semantics for _relative_ vs _absolute_ date displays.

## Utilities (`src/lib/date.ts`)

| Helper                 | Purpose                                | Output Example     |
| ---------------------- | -------------------------------------- | ------------------ |
| `formatISO(date)`      | Canonical short date (storage/display) | `2025-08-15`       |
| `formatDateTime(date)` | Human-readable timestamp               | `2025-08-15 13:45` |
| `formatRelative(date)` | Relative description                   | `3 days ago`       |
| `formatShort(date)`    | Compact UI label                       | `15 Aug`           |
| `daysAgo(date)`        | Numeric diff (days)                    | `3`                |

All helpers accept `Date | string | number`.

## Component-Level Helpers

- `formatTransactionDate` (in `account-details-data.ts`): Returns semantic labels: `Today`, `Yesterday`, `<n> days ago`, else ISO (`YYYY-MM-DD`). Uses `dayjs` internally.
- `formatLastActivity` (in `account-insights.ts`): Provides activity phrases (`Used today`, `Used yesterday`, `Used <n> days/weeks ago`).

## API Date Shapes

- API routes should return ISO date strings (YYYY-MM-DD or full ISO timestamps) without locale formatting.
- Example: stats endpoint balance history now sends `{ date: 'YYYY-MM-DD', balance: number }` via `formatISO`.

## Do / Don’t

**Do**

- Use `formatISO(new Date())` for default form values.
- Use `formatDateTime` for audit/detail pages (created/updated timestamps).
- Use `formatRelative` in time-elapsed badges / feed contexts when desirable.
- Keep raw timestamps (`Date` objects / ISO strings) in data layer & only format at the presentation layer.

**Don’t**

- Don’t call `toLocaleDateString` or `toLocaleString` directly in components.
- Don’t slice ISO strings manually (`split('T')[0]`).
- Don’t persist pre-formatted strings in the database.

## Rationale

Browser locale formatting caused SSR/CSR mismatches (e.g., `21.07.2025` vs `21/07/2025`). Centralizing logic lets us enforce deterministic output and later plug in i18n or timezone conversion (e.g., user settings) with minimal churn.

## Migration Checklist (Completed)

- [x] Introduced `dayjs` + helpers.
- [x] Replaced all `toLocaleDateString` / `toLocaleString` in account & stats components.
- [x] Refactored stats API to use `formatISO` for balance history.
- [x] Updated transaction form default date.
- [x] Converted transaction detail page.
- [x] Added docs.

## Future Enhancements

- Add user timezone preference & set default via `dayjs.tz.setDefault(...)`.
- Add `formatMonthYear` helper for monthly summaries.
- Introduce i18n layer (e.g., `next-intl`) and map helper output to localized strings.
- Add unit tests around relative boundary conditions (0,1,6,7,30 days).

## Testing Suggestions

- Snapshot render components that include dates to ensure stable formatted output.
- Unit test relative functions at controlled fixed `now` (mock `dayjs` or use injectable clock).

## Quick Reference

```
import { formatISO, formatDateTime, formatRelative } from '@/lib/date';
formatISO('2025-08-15T10:30:00Z'); // 2025-08-15
formatDateTime(Date.now()); // 2025-08-15 12:30
formatRelative(new Date(Date.now() - 3*86400000)); // 3 days ago
```

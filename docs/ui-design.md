# UI Design & Screens

## Design Principles

- Minimalistic, modern, mobile-first
- Responsive for desktop and mobile
- Clean layouts, easy navigation
- Fast access to core actions (add spend, scan receipt, view analytics)

## Main Screens

- **Dashboard:** Overview of accounts, spendings, budgets
- **Accounts:** List and manage accounts, balances
- **Add Expense:** Form to add spending/income, with receipt scan/upload
- **Spending Details:** Breakdown of a specific spend (items, prices, receipt image)
- **Planned Purchases:** Wishlist with expected prices, mark as bought
- **Analytics/Reports:** Charts for monthly spend, per-category breakdowns, trends
- **Receipt Scanner:** Upload/take photo, AI parses and pre-fills items
- **User Profile:** Name, image, email, manage family members
- **Family Members/Permissions:** Manage group, roles (admin, viewer, etc.)
- **Settings:** Currency, date format, backup/export, themes
- **Authentication:** Sign in/register

## Accessibility & Responsiveness

- All components should be accessible (ARIA labels, keyboard navigation)
- Responsive layouts adapt to mobile, tablet, and desktop
- Color contrast and font sizes meet WCAG AA standards

## Design Tokens & Theming

- Use Tailwind CSS for consistent spacing, colors, and typography
- Support for dark mode and custom themes via CSS variables or Tailwind config

## UX Notes

- Use shadcn/ui and Tailwind for consistent styling
- Prioritize mobile usability (touch targets, bottom nav)
- Plan for i18n/l10n: all UI text should be translatable, and layouts should accommodate different text lengths and directions
- Design for API error states, loading, and empty data (e.g., "No expenses yet", "Failed to load receipt")

## Visual Mockups & Assets

- All major screens have been designed in a minimalistic, mobile-first style
- Visual references (screenshots, Figma/Sketch files) are stored in `/docs/design-images`
- Keep this documentation in sync with the latest UI changes and design assets

---

_See [docs/roadmap.md](./roadmap.md) for feature delivery order._

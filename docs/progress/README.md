## Progress Logs

This directory contains chronological session/sprint logs capturing project status, decisions, and upcoming priorities.

### Naming Convention

`YYYY-MM-DD-session.md` – One file per significant development session or sprint boundary.

### Purpose

- Provide an auditable trail of scope changes.
- Keep roadmap and reality aligned.
- Accelerate onboarding by showing evolution history.

### How To Use

1. At end of each focused work session, add a new log summarizing:
   - What changed
   - Current status vs roadmap
   - Risks / blockers
   - Next actionable steps
2. Link any major architectural decisions to `docs/architecture.md` or create an ADR if large impact.

### Index

- 2025-08-15 – Initial comprehensive status review (`2025-08-15-session.md`).
- 2026-11-10 – Next.js security patch to 15.5.29, before/after checks (`2026-11-10-session.md`).
- 2026-11-10 – Account opening balance kept on recompute (`2026-11-10-session.md`).
- 2026-11-10 – Sign-in `callbackUrl` open redirect and `javascript:` XSS fixed and missing `user.id` treated as signed out (`2026-11-10-signin-callback-url-session.md`).

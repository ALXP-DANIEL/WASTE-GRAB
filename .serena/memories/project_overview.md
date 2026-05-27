# WasteGrab Project Overview

Last indexed: 2026-05-28.

WasteGrab is an Nx monorepo for a waste collection/recycling application. It has an Angular frontend, an Express API backend, a Prisma/MariaDB data model, and a shared TypeScript domain/API types library.

Nx projects discovered with `npm exec -- nx show projects --json`:
- `frontend`: Angular application at `apps/frontend`.
- `backend`: Express/Node API at `apps/backend`.
- `shared-types`: buildable shared types library at `libs/shared/types`.
- `wastegrab-wa-notifier`: WhatsApp notifier utility at `tools/wa-notifier`.
- `wastegrab`: root project for Docker/release-related inferred targets.

Primary domain areas: authentication/session cookies, user/admin management, customer pickups, collector workflows, waste categories, vouchers/points ledger, notifications/push subscriptions, collection locations, Google Places, Supabase storage, Roboflow AI analysis.

Local development flow from README: install with `npm install`, copy `.env.example` to `.env`, set service keys as needed, run `npm run prisma:generate`, `npm run db:push`, then `npm run dev`. Frontend runs on `http://localhost:4200`; backend API runs on `http://localhost:3000` locally. Docker frontend exposes `http://localhost:8080` with backend on `3001`.
# Codebase Structure

Top-level files: `package.json`, `nx.json`, `tsconfig.base.json`, `eslint.config.mjs`, `vitest.workspace.ts`, `Dockerfile`, `docker-compose.yml`, `.env.example`, `README.md`, `.github/copilot-instructions.md`.

Applications and libraries:
- `apps/frontend`: Angular 21 app. Key files: `src/main.ts`, `src/app/app.config.ts`, `src/app/app.routes.ts`, `src/app/layouts/app-layout.component.ts`, `src/app/services/*`, `src/app/pages/*`, `src/app/ui/zard/*`.
- `apps/backend`: Express 5 + Prisma API. Key files: `src/main.ts`, `src/app.ts`, `src/config.ts`, `src/prisma.ts`, `src/middleware/*`, `src/routes/*`, `src/services/*`, `prisma/schema.prisma`, `scripts/db-push-local.ts`, `scripts/seed-local-data.ts`.
- `libs/shared/types`: shared domain/API types exported from `src/index.ts`; type files live under `src/lib/types`.
- `tools/wa-notifier`: standalone JS WhatsApp notification utility with its own package lock.

Backend route mount points in `apps/backend/src/app.ts` include `/api/health`, `/api/auth`, `/api/places`, `/api/admin/users`, `/api/admin/locations`, `/api/admin/notifications`, `/api/admin/waste-categories`, `/api/admin/vouchers`, `/api/customer/address`, `/api/customer/pickups`, `/api/customer/vouchers`, `/api/notifications`, `/api/roboflow-ai`, and `/api/waste-categories`.

Frontend route map is centralized in `apps/frontend/src/app/app.routes.ts` with lazy pages for home/auth/customer/admin/collector areas and role-gated route data using `UserRole` from `@wastegrab/shared`.

Path aliases in `tsconfig.base.json`: `@wastegrab/shared` -> `libs/shared/types/src/index.ts`; `@/*` -> `apps/frontend/src/app/*`.
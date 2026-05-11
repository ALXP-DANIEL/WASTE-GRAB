# Suggested commands
- Install deps: `npm install` (workspace may need `--legacy-peer-deps` if install conflicts appear).
- Start full dev stack: `npx nx serve shop` (shop depends on `api:serve`).
- Start API only: `npx nx serve api`.
- Build all: `npx nx run-many -t build`.
- Test all: `npx nx run-many -t test`.
- Lint all: `npx nx run-many -t lint`.
- E2E: `npx nx e2e shop-e2e`.
- Graph: `npx nx graph`.
- If Nx is unavailable, install dependencies first; `nx` commands need node_modules.
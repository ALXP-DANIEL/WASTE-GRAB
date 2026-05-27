# Style And Conventions

Instructions source of truth: `.github/copilot-instructions.md`. Follow existing Angular, Express, Prisma, and shared type patterns. Use Zard UI components when available instead of native controls.

Nx conventions:
- Use Nx MCP and resolved Nx project metadata for workspace/project/target questions.
- Run tasks through package-manager-prefixed Nx commands, e.g. `npm exec -- nx run frontend:build`.
- Do not rely only on raw `project.json`; use `nx show project <name> --json` for resolved project config.
- Check `nx_docs` or command help for unfamiliar Nx flags.

Agent shell convention: prefix shell commands with `rtk`; use `rtk proxy` when exact/unfiltered output is needed.

TypeScript style observed:
- Frontend uses Angular standalone components, signals/computed state, RxJS HTTP services, single quotes in frontend TS.
- Backend uses ESM imports with `.js` extensions for local modules, double quotes in backend TS, Express routers, typed request/response imports, Prisma client from generated ESM output.
- Shared types are centralized in `libs/shared/types` and consumed by both apps.
- ESLint enforces Nx module boundaries with tags: frontend can depend on frontend/shared, backend on backend/shared, shared only on shared, type libs only on type libs.

Frontend design guidance from workspace instructions: operational screens should be dense, clear, task-focused, mobile intentional, and should prefer existing layout/component patterns.
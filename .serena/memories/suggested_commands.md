# Suggested Commands

Use `rtk` prefix for Codex shell executions. Project commands below are the underlying commands; in agent runs prefer `rtk <command>` or `rtk proxy <command>` when exact output is needed.

Setup:
- `npm install`
- `cp .env.example .env`
- `npm run prisma:generate`
- `npm run db:push`

Development:
- `npm run dev` - serve backend and frontend through Nx.
- `npm run serve:backend` - serve backend.
- `npm run serve:frontend` - serve frontend, depends on backend serve.

Nx exploration:
- `npm exec -- nx show projects --json`
- `npm exec -- nx show project frontend --json`
- `npm exec -- nx show project backend --json`
- `npm exec -- nx graph --print`

Validation:
- `npm exec -- nx run-many -t typecheck lint test --parallel=3`
- `npm exec -- nx run-many -t build --parallel=3`
- `npm exec -- nx run backend:prisma:generate`
- `npm exec -- nx run backend:db:push`

Docker:
- `npm run docker:build`
- `npm run docker:up`

Utility:
- `rtk git status --short`
- `rtk rg <pattern>`
- `rtk rg --files`
- `rtk npm exec -- nx report`
# Task Completion Checklist

Before finishing code changes:
- Check `git status --short` and avoid reverting user changes.
- For source changes, run the narrowest relevant Nx target first.
- For broader changes, run `npm exec -- nx run-many -t typecheck lint test --parallel=3`.
- For production or build/config changes, run `npm exec -- nx run-many -t build --parallel=3`.
- If backend Prisma schema or generated client is touched, run `npm exec -- nx run backend:prisma:generate` and the relevant Prisma/db target.
- If frontend user-facing work changes layout, verify responsive behavior and use existing Zard/layout conventions.
- Note test gaps explicitly; current test targets pass with no test files in frontend/backend/shared-types.

Latest validation during onboarding:
- `npm exec -- nx run-many -t typecheck lint test --parallel=3` passed for 4 projects plus backend Prisma generation.
- `npm exec -- nx run-many -t build --parallel=3` passed for backend, frontend, and shared-types.
- Frontend build emitted an initial bundle budget warning: 607.58 kB versus 600 kB warning threshold.
- Nx reported: `Your AI agent configuration is outdated. Run "nx configure-ai-agents" to update.`
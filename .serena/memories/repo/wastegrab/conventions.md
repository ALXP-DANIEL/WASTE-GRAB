# Style and conventions
- TypeScript-first workspace.
- Angular app uses SSR and zone.js.
- Projects use Nx tags for module boundaries: `scope:shop`, `scope:api`, `scope:shared`, plus `type:feature`, `type:data`, `type:ui`.
- Keep changes consistent with existing Angular/Nx structure and project.json target naming.
- Prefer Nx targets over direct tooling commands when running builds/tests/lint.
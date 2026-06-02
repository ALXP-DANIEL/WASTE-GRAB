# WasteGrab Shared AI Instructions

These instructions are shared by GitHub Copilot and Codex. Keep workspace behavior here so both assistants follow the same rules.

## Tooling Priority

1. Nx MCP for workspace understanding, project graph questions, targets, and Nx task context.
2. Serena MCP for semantic code search, symbol navigation, and cross-file code understanding.
3. Caveman MCP for compression-oriented file/context workflows when large local content needs reduction.
4. RTK CLI (`rtk`) for compressed shell command output. RTK is not an MCP server.
5. Code changes should follow existing project patterns and stay tightly scoped.

## MCP Configuration

- Use the workspace MCP configuration in `.vscode/mcp.json`.
- Configured workspace MCP servers:
  - `nx`: `npm exec -- nx mcp --minimal`
  - `serena`: `uvx --from serena-agent serena start-mcp-server --project-from-cwd`
  - `caveman`: `uvx caveman-mcp`
  - `github`: `https://api.githubcopilot.com/mcp/`
- Codex MCP config lives in `.codex/config.toml`.
- If Copilot cannot see MCP tools, use VS Code Command Palette: `MCP: List Servers` or `MCP: Open Workspace Folder MCP Configuration`.

## Nx Workflow

- For navigating or understanding this workspace, inspect Nx project metadata before guessing paths or targets.
- Run tasks through Nx, for example `npm exec -- nx run frontend:build` or `npm exec -- nx run-many -t typecheck,lint`.
- Prefer the package-manager-prefixed Nx command form (`npm exec -- nx ...`) over global `nx`.
- Do not call underlying tools directly when an Nx target exists.
- For generators or scaffolding, prefer Nx generators and check generator options before use.
- For unfamiliar Nx options, plugin behavior, or migration details, check Nx docs or command help before assuming.

## Graphify Workflow

- This repo intentionally keeps a focused Graphify graph in `graphify-out/`.
- Do not run `graphify update .` from the repository root; that pulls in tooling, generated files, reports, and hidden workspace content and makes the graph noisy.
- Default refresh path: use the VS Code task `Graphify: update codebase graph`, which runs `tools/graphify/update-codebase-graphify.sh label`.
- The helper script also supports `tools/graphify/update-codebase-graphify.sh ast` for no-LLM AST refresh and `tools/graphify/update-codebase-graphify.sh deep` for slower local/self-hosted LLM semantic extraction. Use these intentionally from the terminal rather than adding extra VS Code task noise.
- The focused corpus is backend routes/services/middleware/config, frontend pages/services/routes, shared types, and e2e source/config. Runtime outputs such as Playwright reports, Graphify cache internals, `.github`, `.agents`, `.vscode`, and generated Prisma clients must stay out of the graph corpus.
- When using LM Studio, set `OLLAMA_BASE_URL=http://127.0.0.1:1234/v1`, `OLLAMA_MODEL=<loaded model id>`, `OLLAMA_API_KEY=lm-studio`, and `GRAPHIFY_BACKEND=ollama`; keep `GRAPHIFY_MAX_CONCURRENCY=1` for local models.
- The Graphify script checks `/v1/models`; if LM Studio is not running or the requested model is not loaded, ask the developer to start LM Studio, load the model, and rerun the task.
- After a refresh, `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.html`, `graphify-out/graph.json`, `graphify-out/manifest.json`, and `graphify-out/cache/stat-index.json` should agree on the same focused graph.

## Codebase Conventions

- Follow existing Angular, Express, Prisma, and shared type patterns.
- Use Zard UI components when available instead of native controls.

## Frontend Conventions

- Keep operational screens dense, clear, and task-focused.
- Prefer existing layout/component patterns over introducing a new design language.
- Use icons for icon-sized actions when available.
- Make mobile layouts intentional, not just squeezed desktop layouts.

<!-- rtk-instructions v2 -->
# RTK — Token-Optimized CLI

**rtk** is a CLI proxy that filters and compresses command outputs, saving 60-90% tokens.

## Rule

Always prefix shell commands with `rtk`:

```bash
# Instead of:              Use:
git status                 rtk git status
git log -10                rtk git log -10
cargo test                 rtk cargo test
docker ps                  rtk docker ps
kubectl get pods           rtk kubectl pods
```

## Meta commands (use directly)

```bash
rtk gain              # Token savings dashboard
rtk gain --history    # Per-command savings history
rtk discover          # Find missed rtk opportunities
rtk proxy <cmd>       # Run raw (no filtering) but track usage
```
<!-- /rtk-instructions -->

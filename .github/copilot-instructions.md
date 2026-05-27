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
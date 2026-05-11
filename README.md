# WasteGrab



<h1>Smart Recycling Made Simple</h1>

✨ A repository showcasing a basic Angular + Express Todo CRUD flow in an Nx monorepo ✨
🚀 If you haven't connected to Nx Cloud yet, [complete your setup here](https://cloud.nx.app/setup/connect-workspace/guide). Get faster builds with remote caching, distributed task execution, and self-healing CI. [See how your workspace can benefit](#nx-cloud).
## 📦 Project Overview

This repository now demonstrates a compact learning stack with:

- **2 Applications**

  - `frontend` - Angular frontend for todo CRUD
  - `api` - Express API with Docker support serving todo data

- **2 Libraries**

  - `@wastegrab/models` - Shared data models
  - `@wastegrab/api-todos` - In-memory todo data store and routes

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Serve the Angular app (this will simultaneously serve the API backend)
npx nx serve frontend

# ...or you can serve the API separately
npx nx serve api

# Build all projects
npx nx run-many -t build

# Lint all projects
npx nx run-many -t lint

# Run tasks in parallel

npx nx run-many -t lint build --parallel=3

# Visualize the project graph
npx nx graph
```

## ⭐ Featured Nx Capabilities

This repository showcases several powerful Nx features:

### 1. 🔒 Module Boundaries

Enforces architectural constraints using tags. Each project has specific dependencies it can use:

- `scope:shared` - Can be used by all projects
- `scope:frontend` - Frontend-specific libraries
- `scope:api` - API-specific libraries
- `type:feature` - Feature libraries
- `type:data` - Data access libraries
- `type:ui` - UI component libraries

**Try it out:**

```bash
# See the current project graph and boundaries
npx nx graph

# View a specific project's details
npx nx show project frontend --web
```

[Learn more about module boundaries →](https://nx.dev/features/enforce-module-boundaries)

### 2. 🐳 Docker Integration

The API project includes Docker support with automated targets and release management:

```bash
# Build Docker image
npx nx docker:build api

# Run Docker container
npx nx docker:run api

# Release with automatic Docker image versioning
npx nx release
```

**Nx Release for Docker:** The repository is configured to use Nx Release for managing Docker image versioning and publishing. When running `nx release`, Docker images for the API project are automatically versioned and published based on the release configuration in `nx.json`. This integrates seamlessly with semantic versioning and changelog generation.

[Learn more about Docker integration →](https://nx.dev/recipes/nx-release/release-docker-images)

### 3. 🔧 Self-Healing CI

The CI pipeline includes `nx fix-ci` which automatically identifies and suggests fixes for common issues:

```bash
# In CI, this command provides automated fixes
npx nx fix-ci
```

This feature helps maintain a healthy CI pipeline by automatically detecting and suggesting solutions for:

- Missing dependencies
- Incorrect task configurations
- Cache invalidation issues
- Common build failures

[Learn more about self-healing CI →](https://nx.dev/ci/features/self-healing-ci)

## 📁 Project Structure

```
├── apps/
│   ├── frontend/       [scope:frontend] - Angular todo frontend
│   └── api/            [scope:api]     - Backend API with Docker
├── libs/
│   ├── api/
│   │   └── todos/        [scope:api,type:data] - Todo API helpers
│   └── shared/
│       └── models/       [scope:shared,type:data] - Shared models
├── nx.json             - Nx configuration
├── tsconfig.json       - TypeScript configuration
└── eslint.config.mjs   - ESLint with module boundary rules
```

## 🏷️ Understanding Tags

This repository uses tags to enforce module boundaries:

| Project  | Tags                        | Can Import From             |
| -------- | --------------------------- | --------------------------- |
| `frontend` | `scope:frontend`           | `scope:frontend`, `scope:shared`|
| `api`    | `scope:api`                 | `scope:api`, `scope:shared` |
| `models` | `scope:shared`, `type:data` | Nothing (base library)      |
| `api-todos` | `scope:api`, `type:data`  | `scope:shared`              |

## 📚 Useful Commands

```bash
# Project exploration
npx nx graph                                    # Interactive dependency graph
npx nx list                                     # List installed plugins
npx nx show project frontend --web             # View project details

# Development
npx nx serve frontend                          # Serve Angular app and API together
npx nx serve api                               # Serve backend API only
npx nx build frontend                          # Build Angular app
npx nx lint frontend                           # Lint the Angular app

# Running multiple tasks
npx nx run-many -t build                       # Build all projects
npx nx run-many -t lint build                  # Run multiple targets

# Affected commands (great for CI)
npx nx affected -t build                       # Build only affected projects
# Docker operations
npx nx docker:build api                        # Build Docker image
npx nx docker:run api                          # Run Docker container
```

## 🎯 Adding New Features

### Generate a new Angular application:

```bash
npx nx g @nx/angular:app my-app
```

### Generate a new Angular library:

```bash
npx nx g @nx/angular:lib my-lib
```

### Generate a new Angular component:

```bash
npx nx g @nx/angular:component my-component --project=my-lib
```

### Generate a new API library:

```bash
npx nx g @nx/node:lib my-api-lib
```

You can use `npx nx list` to see all available plugins and `npx nx list <plugin-name>` to see all generators for a specific plugin.

## Nx Cloud

Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## 🔗 Learn More

- [Nx Documentation](https://nx.dev)
- [Angular Monorepo Tutorial](https://nx.dev/getting-started/tutorials/angular-monorepo-tutorial)
- [Module Boundaries](https://nx.dev/features/enforce-module-boundaries)
- [Docker Integration](https://nx.dev/recipes/nx-release/release-docker-images)
- [Vite with Angular](https://nx.dev/recipes/vite)
- [Nx Cloud](https://nx.dev/ci/intro/why-nx-cloud)
- [Releasing Packages](https://nx.dev/features/manage-releases)

## 💬 Community

Join the Nx community:

- [Discord](https://go.nx.dev/community)
- [X (Twitter)](https://twitter.com/nxdevtools)
- [LinkedIn](https://www.linkedin.com/company/nrwl)
- [YouTube](https://www.youtube.com/@nxdevtools)
- [Blog](https://nx.dev/blog)

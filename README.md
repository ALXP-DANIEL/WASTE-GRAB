# WasteGrab Nx Monorepo

WasteGrab now runs as an Nx workspace with:

- `apps/frontend`: Angular app
- `apps/backend`: Express + Prisma API
- `libs/shared/types`: shared domain/API types

## Local Development

Install once:

```bash
npm install
```

Create a workspace env file:

```bash
cp .env.example .env
```

Set `GOOGLE_MAPS_API_KEY` in `.env` to enable backend-powered location autocomplete.

Generate Prisma and sync your local database:

```bash
npm run prisma:generate
npm run db:push
```

Run both apps through Nx:

```bash
npm run dev
```

The frontend serves on `http://localhost:4200` and proxies `/api` to the backend on `http://localhost:3000`.

## Docker

Build and run the full stack:

```bash
npm run docker:up
```

The Docker frontend is exposed at `http://localhost:8080`, with `/api` proxied to the backend service.

Compose starts MariaDB, runs `backend:db:push` through Nx, then starts the backend and frontend containers.

# WasteGrab

WasteGrab is a web-based smart recycling pickup and rewards platform. It helps customers request recyclable waste collection, helps collectors manage pickup routes and verification, and gives admins tools to manage the recycling workflow from one place.

The project is built as an Nx monorepo with an Angular frontend, an Express/Prisma backend, and a shared TypeScript types library for common API and domain models.

## Project Context

WasteGrab was created as a capstone project to make recyclable waste collection easier, more organized, and more rewarding. The platform connects three main user roles:

- **Customers** create pickup requests, upload waste images, manage saved addresses, track pickup status, earn reward points, and redeem vouchers.
- **Collectors** view available pickups, accept jobs, manage assigned pickups, update pickup progress, verify actual waste weight, and use map-based route planning.
- **Admins** manage users, pickups, waste categories, collection locations, vouchers, notifications, and reward activity.

The system includes AI-assisted waste analysis through Roboflow. Customers can upload waste images and receive suggested waste categories, estimated weight, and estimated reward points before submitting a pickup request. The estimate can still be manually adjusted before submission.

## Key Features

- Role-based authentication for customer, collector, and admin users
- Customer pickup request creation with image upload
- AI-assisted waste category, weight, and reward point estimation
- Manual adjustment of estimated waste details before submission
- Saved customer address management
- Pickup lifecycle tracking: Pending, Accepted, Arrived, Verified, Completed, Cancelled
- Customer pickup history and pickup detail page
- Collector dashboard for available and assigned pickups
- Collector route planning with MapLibre and OSRM route preview
- Multi-stop route handling for assigned pickups
- Collector verification of actual waste weight and final reward value
- Admin management for users, pickups, waste categories, collection locations, vouchers, and notifications
- Collection location management with Google Places search and place images
- Reward points ledger for customer earnings and spending
- Voucher catalog and redemption system
- In-app notifications, notification stream support, and web push support
- Responsive frontend workflows for customer, collector, and admin users
- End-to-end and API testing support for key customer, collector, admin, and platform flows

## Tech Stack

### Frontend

- Angular 21
- TypeScript
- Tailwind CSS
- Zard UI components
- Angular Router and Angular services
- MapLibre GL for map rendering

### Backend

- Node.js
- Express.js
- Prisma 7
- MySQL/MariaDB
- REST API
- Cookie-based authentication

### AI, Images, and Storage

- Roboflow API for waste image analysis
- Multer for multipart uploads
- Sharp for image processing
- Supabase Storage for public image storage

### Maps and Route Planning

- Google Maps Places API for location search/autocomplete
- MapLibre GL for frontend maps
- OSRM routing API for route previews

### Notifications

- In-app notifications
- Server-Sent Events notification stream
- Web Push support

### Testing and Quality

- Playwright E2E tests
- Vitest
- API operation tests
- ESLint
- GitHub Actions CI

### DevOps and Tooling

- Nx monorepo
- Docker and Docker Compose
- Railway deployment workflow
- GHCR container image publishing
- Graphify knowledge graph tooling for codebase analysis

## Workspace Structure

```text
apps/
  frontend/       Angular web application
  backend/        Express API, Prisma schema, backend services
  e2e/            Playwright end-to-end and API tests

libs/
  shared/types/   Shared TypeScript domain and API types

tools/
  graphify/       Codebase graph update helpers
  wa-notifier/    CI notification helper
```

## Main Application Areas

### Customer

Customers can register/login, manage profile details, save pickup addresses, create pickup requests, upload waste images, review AI-assisted estimates, track pickup progress, view pickup history, and redeem vouchers with earned points.

### Collector

Collectors can review available pickup requests, accept jobs, view assigned pickups, update pickup status, verify actual waste weight, complete pickups, view route maps, and inspect collection/drop-off locations.

### Admin

Admins can manage the operational data of the platform, including users, pickup requests, waste categories, collection locations, vouchers, point ledger activity, and notifications.

## Local Development

Install dependencies:

```bash
npm install
```

Create a workspace environment file:

```bash
cp .env.example .env
```

At minimum, configure a valid `DATABASE_URL`. Optional integrations can be enabled through:

- `GOOGLE_MAPS_API_KEY` for Google Places search
- `ROBOFLOW_API_KEY` for AI image analysis
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for image storage
- `WEB_PUSH_PUBLIC_KEY`, `WEB_PUSH_PRIVATE_KEY`, and `WEB_PUSH_SUBJECT` for push notifications

Generate Prisma and sync the database schema:

```bash
npm run prisma:generate
npm run db:push
```

Run the frontend and backend together:

```bash
npm run dev
```

The frontend runs at:

```text
http://localhost:4200
```

The backend API runs at:

```text
http://localhost:3000/api
```

The Angular dev server proxies `/api` requests to the backend.

## Useful Commands

```bash
npm run dev                 # Serve frontend and backend through Nx
npm run build               # Build frontend and backend
npm run typecheck           # Typecheck all projects
npm run prisma:generate     # Generate Prisma client
npm run db:push             # Push Prisma schema to the configured database
npm run docker:build        # Build Docker images
npm run docker:up           # Run the stack with Docker Compose
```

Nx targets are also available directly, for example:

```bash
npm exec -- nx run frontend:typecheck
npm exec -- nx run backend:typecheck
npm exec -- nx run frontend:lint
npm exec -- nx run backend:lint
npm exec -- nx run e2e:e2e
```

## Docker

Run the full stack with Docker Compose:

```bash
npm run docker:up
```

Docker Compose starts:

- MariaDB
- A migration/sync container that runs `backend:db:push`
- Backend API
- Frontend served by Nginx

The Docker frontend is exposed at:

```text
http://localhost:8080
```

The Docker backend is exposed at:

```text
http://localhost:3001/api
```

## Testing

The workspace includes Playwright E2E tests and API operation tests under `apps/e2e`.

Common verification commands:

```bash
npm exec -- nx run frontend:typecheck
npm exec -- nx run backend:typecheck
npm exec -- nx run frontend:lint
npm exec -- nx run backend:lint
npm exec -- nx run e2e:e2e
```

CI runs build, database sync, tests, Docker image workflows, and deployment-related checks through GitHub Actions.

## Environment Variables

See `.env.example` for the full list. Important variables include:

```text
PORT
CORS_ORIGIN
DATABASE_URL
AUTH_SECRET
GOOGLE_MAPS_API_KEY
ROBOFLOW_API_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_PICKUP_IMAGES_BUCKET
SUPABASE_USER_AVATARS_BUCKET
WEB_PUSH_PUBLIC_KEY
WEB_PUSH_PRIVATE_KEY
WEB_PUSH_SUBJECT
```

## Deployment Notes

The repository includes Docker targets for frontend and backend builds. GitHub Actions includes workflows for CI, GHCR image publishing, and Railway redeployment.

For production-style deployments, configure secure values for:

- `DATABASE_URL`
- `AUTH_SECRET`
- Supabase credentials
- Roboflow API key
- Google Maps API key
- Web Push VAPID keys
- CORS and cookie security settings

## Codebase Analysis

This repository includes Graphify tooling for generating and querying a codebase knowledge graph. The graph output lives in `graphify-out/` and can be refreshed using the helper task/script documented in the workspace instructions.

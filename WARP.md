# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common commands
- Install deps: `npm install`
- Dev server (Vite + Express middleware): `npm run dev` (serves on http://localhost:8081)
- Build (client + server): `npm run build`
  - Client output: `dist/spa`
  - Server output (ESM): `dist/server/node-build.mjs`
- Type-check: `npm run typecheck`
- Format all files: `npm run format.fix`
- Run all tests (Vitest): `npm test`
- Run a single test:
  - By file: `npx vitest run client/lib/utils.spec.ts`
  - By name: `npx vitest run -t "cn function"`

Notes:
- The `start` script points to `server.js`, which does not exist. For production/local run after build, use: `node dist/server/node-build.mjs`.
- Dev server binds to 0.0.0.0:8081 and mounts the Express app as Vite middleware; API routes are available under `/api/*` during dev.

## Environment
Create a `.env` file (do not commit secrets) with the following keys as needed:
- `MONGODB_URI`
- `JWT_SECRET`
- `PORT` (default 8080 for Docker, Vite dev uses 8081)
- `NODE_ENV`
- `TELEGRAM_BOT_TOKEN`
- `SITE_URL`

Dev behavior without MongoDB:
- Server attempts to connect on startup; if it fails, some public endpoints (e.g. `/api/courses`) fall back to safe defaults so the SPA loads. Admin features require a working DB.

## Architecture overview
- Tooling
  - Vite (React + SWC) with custom dev-time Express plugin (`vite.config.ts`) that mounts the backend into the Vite dev server.
  - TypeScript with path aliases: `@/* -> ./client/*`, `@shared/* -> ./shared/*` (see `tsconfig.json`).
  - TailwindCSS + tailwind-animate (`tailwind.config.ts`, `postcss.config.js`).
  - Testing: Vitest (example at `client/lib/utils.spec.ts`).

- Frontend (SPA)
  - Entry: `index.html` → `/client/App.tsx`.
  - Router: `react-router-dom` with routes for `/`, `/home`, `/courses`, `/my-courses`, `/projects/:sub`, `/admin/*`, `/learning/:courseId`, etc.
  - Layout: `client/AppLayout.tsx` provides a persistent sidebar/topbar shell; detail pages (e.g. `courses/:courseId`) render inside this layout.
  - State/data: TanStack Query used for client-side data fetching/caching; UI built with shadcn/radix components under `client/components/ui/*` and TailwindCSS via `client/global.css`.

- Backend (Express API)
  - Source: `server/index.ts`; exported `createServer()` configures middleware, static `/uploads`, and API routes.
  - Persistence: Mongoose models defined inline (User, Payment, Course, Module, Lesson, Message). JWT-based auth with `Authorization: Bearer <token>`; file uploads via multer to `uploads/courses`.
  - Public endpoints: health (`/api/ping`), demo (`/api/demo`), courses (`/api/courses`) with graceful fallback when DB is disconnected.
  - Admin/user endpoints: CRUD for users/courses/modules/lessons/payments/messages under `/api/admin/*` plus auth endpoints under `/api/auth/*` and payment endpoints under `/api/payments/*`.
  - Shared types: `shared/api.ts` (e.g., `AdminNotification`, `NotificationEvent`) are imported by both client and server.
  - Build for prod: `vite.config.server.ts` bundles `server/node-build.ts` to ESM in `dist/server/` (externalizes node libs and main deps).

- Legacy folder
  - `prox/` contains older client/server files not wired into the current Vite entry. The active app uses `client/` and `server/` at the repo root.

- Docker/Reverse proxy
  - `Dockerfile` builds the app but expects `npm start` to run `server.js` (missing). Adjust to `node dist/server/node-build.mjs` after `npm run build`.
  - `docker-compose.yml` includes `nginx` reverse proxy and mounts `./uploads`; update `nginx.conf` and environment variables before use.

## Assistant/tooling notes
- Cursor MCP: `.cursor/deploy-app.mdc` indicates deployments use Netlify MCP tools. If asked to deploy, prefer those tools; local `npm run build` is helpful but not required by Netlify.
- Vite dev server `allowedHosts`: configured for `prox.uz` and localhost; dev runs at `http://localhost:8081`.

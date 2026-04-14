# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack online bookstore deployed as a single Vercel project. Client and API share one domain; the Express backend runs as a Vercel serverless function.

- **Client:** Vue 3 + TypeScript, Vite, Vue Router, Pinia, Tailwind CSS + DaisyUI
- **Server:** Node.js + Express + TypeScript, Drizzle ORM, PostgreSQL (NeonDB), Zod validation
- **Payments:** Stripe

## Repository Layout

```
/                       root — Vercel build + serverless deps
├── package.json        backend deps for the serverless function (api/)
├── tsconfig.json       compiles api/**/*.ts for Vercel
├── vercel.json         build + SPA/API rewrites
├── api/
│   └── index.ts        Vercel serverless entry — wraps server/src/app under /api
├── client/             Vue 3 app (own package.json, tsconfig)
├── server/
│   ├── src/            Express app source (shared: imported by api/index.ts)
│   ├── migrations/     Drizzle migrations
│   ├── drizzle.config.ts
│   └── package.json    used for local dev + db tooling (nodemon, drizzle-kit)
└── notes/              design/feature notes
```

Root `package.json` and `server/package.json` both declare backend dependencies. Root is required by Vercel to resolve imports from `api/index.ts → ../server/src/app`; `server/package.json` is used for local Express dev and Drizzle CLI. Keep the two in sync when upgrading backend deps.

## Commands

### Client (`cd client`)
- `npm run dev` — Vite dev server (port 5173)
- `npm run build` — type-check + production build
- `npm run type-check` — Vue TSC only

### Server (`cd server`) — local development + DB tooling
- `npm run dev` — nodemon with ts-node (auto-reload, port 8000)
- `npm run build` — `tsc` to `dist/`
- `npm run start` — run compiled `dist/server.js`
- `npm run db:generate` — generate Drizzle migrations
- `npm run db:push` — apply migrations to database
- `npm run db:seed` — seed initial data
- `npm run studio` — Drizzle Studio (visual DB browser)

### Production build (Vercel, runs from root)
- `npm run build` → `cd client && npm install && npm run build`
- Vercel auto-compiles `api/**/*.ts` using root `tsconfig.json` and installs root `package.json` deps for the serverless function.

No test suite is configured.

## Architecture

### Serverless entry
- `api/index.ts` creates a thin Express wrapper that mounts `server/src/app` under `/api`, so `/api/books` → `/books` in the Express router.
- `vercel.json` rewrites `/api/:path*` → `/api` (single function) and `/:path*` → `/index.html` (SPA fallback).

### Server (`server/src/`)
- Local entry: `server/src/server.ts` → `server/src/app.ts` (Express app). Production uses `app.ts` directly via `api/index.ts`.
- Routes in `server/src/routes/`: `books.ts`, `categories.ts`, `orders.ts`, `auth.ts`, `payments.ts`
- Auth middleware in `server/src/middleware/auth.ts` — JWT in httpOnly cookies, protects routes via `authMiddleware`
- DB schema in `server/src/db/schema.ts` (Drizzle ORM) — tables: users, categories, books, customers, orders, lineItems
- Migrations in `server/migrations/`; config in `server/drizzle.config.ts`

### Client
- Vite config + path alias: `@` → `client/src/`
- Router in `client/src/router/` — route guard checks `canAccessCheckout` before checkout
- Pinia stores in `client/src/stores/`: `cart.ts` (localStorage-synced), `category.ts`, `checkout.ts`
- Views in `client/src/views/`, components in `client/src/components/`
- API base path is `/api` (same origin as client); no separate backend URL needed.

### Auth Flow
- Register/login with bcrypt password hashing and JWT
- JWT stored in httpOnly cookie (not localStorage), 7-day expiry, `sameSite=none` in production
- `POST /orders` requires auth; guest orders supported via nullable `userId` FK
- `GET /orders` (user's order history) is protected

## Environment Variables

Configure in Vercel project settings for production; use `server/.env` locally (see `server/.env.example`):
- `DATABASE_URL` — PostgreSQL connection string (NeonDB)
- `JWT_SECRET` — secret for signing JWTs
- `STRIPE_SECRET_KEY` — Stripe API key
- `CORS_ORIGIN` — frontend URL for local dev (e.g. `http://localhost:5173`); not needed in production (same origin)
- `PORT` — local server port (defaults to 8000); ignored on Vercel

## Deployment

- Single Vercel project: client static assets + `api/index.ts` serverless function on the same domain.
- Build: `cd client && npm install && npm run build` (from `vercel.json`).
- SPA rewrite + `/api/*` → serverless handler in `vercel.json`.
- Migrations are run manually via `cd server && npm run db:push` against the production `DATABASE_URL`.
